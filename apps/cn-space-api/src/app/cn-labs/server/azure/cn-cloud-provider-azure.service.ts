import { Disk, ImageReference, SshPublicKey } from '@azure/arm-compute';
import { Injectable } from '@nestjs/common';

import { CnCloudProviderName } from '../../../cn-cloud-providers/cn-cloud-provider.entity';
import { CnCoreConfigService } from '../../../cn-core/modules/cn-core-config/cn-core-config.service';
import { CnCommandService } from '../../../cn-core/services/cn-command.service';
import { CnLab } from '../../cn-lab.entity';
import { CnLabVolumeType } from '../../volume/cn-lab-volume-entity';
import {
  CN_SERVERS_SSH_AUTHORIZED_KEY_PATH,
  CnCpCreateInstanceRequest,
  CnCpCreateVolumeRequest,
  CnCpInstance,
  CnCpInstanceWithVolume,
  CnCpStaticIpAddress,
  CnCpVolume,
  CnCpVolumeStatus,
} from '../cn-cloud-provider.class';
import { CnCloudProviderService } from '../cn-cloud-provider.service';
import { CnInstanceNotFoundException } from '../cn-instance-not-found.exception';
import { CnAzureInstance, CnAzureVolumeStatus } from './cn-azure.class';
import { CnAzureService } from './cn-azure.service';

@Injectable()
export class CnCloudProviderAzureService extends CnCloudProviderService {
  private static MOUNT_FILE = 'mount_azure.sh';

  // ubuntu 20.04 LTS
  private static IMAGE_REF: ImageReference = {
    publisher: 'Canonical',
    offer: '0001-com-ubuntu-server-focal',
    sku: '20_04-lts-gen2',
    version: 'latest',
  };

  constructor(
    private azureService: CnAzureService,
    configService: CnCoreConfigService,
    commandService: CnCommandService
  ) {
    super(commandService, configService);
  }

  getName(): CnCloudProviderName {
    return 'AZURE';
  }

  getSshPrivateKeyFilePath(): string {
    return this.configService.getMainSshPrivateKeyFilePath();
  }

  getSshUserName(): string {
    return 'ubuntu';
  }

  /////////////////////// INSTANCE ///////////////////////
  async createInstance(request: CnCpCreateInstanceRequest): Promise<CnCpInstance> {
    // retrieve the ssh key stored in azure
    const ssh = await this.azureService.getSshKey(this.configService.getAzureSshKey());
    const sshPublicKey: SshPublicKey = {
      path: CN_SERVERS_SSH_AUTHORIZED_KEY_PATH,
      keyData: ssh.publicKey,
    };

    // eslint-disable-next-line max-len
    const subnet = `${this.azureService.getResourceGroupFullId()}/providers/Microsoft.Network/virtualNetworks/${this.configService.getAzureNetwork()}/subnets/${this.configService.getAzureNetworkSubnet()}`;

    const virtualMachine = await this.azureService.createInstance(
      request.name,
      request.region,
      request.serverName,
      CnCloudProviderAzureService.IMAGE_REF,
      sshPublicKey,
      subnet
    );

    const instance = new CnAzureInstance(virtualMachine);
    return this.getInstance(instance.id);
  }

  createInstanceWithVolume(): Promise<CnCpInstanceWithVolume> {
    // the volume is created separately so this is not called
    throw new Error('Not implemented');
  }

  async deleteInstance(id: string): Promise<void> {
    const instance = await this.getAzureInstance(id);
    await this.azureService.deleteInstance(id);

    // delete the os disk
    const osDisk = instance.getOsDiskName();
    if (osDisk) {
      await this.azureService.deleteVolume(osDisk);
    }
  }

  async getInstance(id: string): Promise<CnCpInstance> {
    const instance = await this.getAzureInstance(id);
    return instance.toStandardInstance();
  }

  private async getAzureInstance(id: string): Promise<CnAzureInstance> {
    try {
      const virtualMachine = await this.azureService.getInstance(id);
      return new CnAzureInstance(virtualMachine);
    } catch (error: any) {
      if (error?.statusCode === 404) {
        throw new CnInstanceNotFoundException(id, 'Azure');
      }
      throw error;
    }
  }

  startInstance(id: string): Promise<void> {
    return this.azureService.startInstance(id);
  }

  stopInstance(id: string): Promise<void> {
    return this.azureService.stopInstance(id);
  }

  /////////////////////// VOLUME ///////////////////////

  volumeIsCreatedSeparately(): boolean {
    return true;
  }

  async attachVolumeToInstance(instanceId: string, volumeId: string): Promise<CnCpVolume> {
    await this.azureService.attachVolume(instanceId, volumeId);

    return this.getVolume(volumeId);
  }

  async createVolume(volume: CnCpCreateVolumeRequest): Promise<CnCpVolume> {
    const disk = await this.azureService.createVolume(volume.name, volume.region, volume.size);

    return this.convertAzureVolume(disk);
  }

  async deleteVolume(volumeId: string): Promise<void> {
    await this.azureService.deleteVolume(volumeId);
  }

  async getVolume(volumeId: string): Promise<CnCpVolume> {
    const disk = await this.azureService.getVolume(volumeId);

    return this.convertAzureVolume(disk);
  }

  async volumeIsAttachedToInstance(instanceId: string, volumeId: string): Promise<boolean> {
    const virtualMachine = await this.azureService.getInstance(instanceId);
    const instance = new CnAzureInstance(virtualMachine);
    return instance.getVolumeName() === volumeId;
  }

  async mountVolume(lab: CnLab): Promise<void> {
    const azureInstance = await this.getAzureInstance(lab.serverInstanceId);

    const volume = azureInstance.getVolume();
    if (volume == null) {
      throw new Error(`No volume attached to instance ${lab.serverInstanceId}`);
    }

    const labSshService = this.instantiateLabSshService(lab);
    const mountScript = labSshService.getMountFolder() + '/' + CnCloudProviderAzureService.MOUNT_FILE;

    // call the mount script with the LUN disk number
    await labSshService.execSshCommand([`bash ${mountScript} ${volume.lun}`]);
  }

  private convertAzureVolume(disk: Disk): CnCpVolume {
    return {
      region: disk.location,
      status: this.azureVolumeStatusToCpStatus(disk.diskState as any, disk.name),
      type: CnLabVolumeType.HIGH_SPEED,
      size: disk.diskSizeGB,
      id: disk.name,
      originalObject: disk,
    };
  }

  private azureVolumeStatusToCpStatus(status: CnAzureVolumeStatus, name: string): CnCpVolumeStatus {
    switch (status) {
      case 'Detached':
      case 'Unattached':
        return 'AVAILABLE';
      case 'Attached':
      case 'Reserved':
      case 'Frozen':
        return 'IN_USE';
      default:
        throw new Error(`Unknown status ${String(status)} for azure disk ${name}`);
    }
  }

  /////////////////////////////////////// IP ADDRESS ///////////////////////////////////////
  needStaticIpAddressBeforeInstance(): boolean {
    return false;
  }

  createStaticIpAddress(): Promise<CnCpStaticIpAddress | null> {
    return null;
  }

  deleteIpAddress(): Promise<void> {
    return null;
  }

  getIpAddressFromId(): Promise<CnCpStaticIpAddress | null> {
    return null;
  }

  async getIpAddressFromInstanceId(id: string): Promise<string> {
    const instance = await this.getAzureInstance(id);

    return (await this.azureService.getIpAddresses(instance.getNetworkId())).ipAddress;
  }
}
