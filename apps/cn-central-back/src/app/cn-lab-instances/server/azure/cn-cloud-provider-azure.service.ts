import {Injectable} from '@nestjs/common';
import {CnCloudProviderService} from '../cn-cloud-provider.service';
import {CnCloudProviderName} from '../../../cn-cloud-providers/cn-cloud-provider.entity';
import {
  CnCpCreateInstanceRequest,
  CnCpCreateVolumeRequest,
  CnCpInstance,
  CnCpInstanceStatus,
  CnCpVolume,
  CnCpVolumeStatus,
  cnServerSshAuthorizedKeyPath
} from '../cn-cloud-provider.class';
import {CnAzureService} from './cn-azure.service';
import {CnLabInstance, CnLabInstanceBillingMode, CnLabInstanceVolumeType} from '../../cn-lab-instance.entity';
import {CnAzureInstance, CnAzureInstanceStatus, CnAzureVolumeStatus} from './cn-azure.class';
import {Disk, ImageReference, SshPublicKey} from '@azure/arm-compute';
import {CnCoreConfigService} from '../../../cn-core/modules/cn-core-config/cn-core-config.service';
import {CnCommandService} from '../../../cn-core/services/cn-command.service';

@Injectable()
export class CnCloudProviderAzureService extends CnCloudProviderService {

  private static MOUNT_FILE = 'mount_azure.sh';
  private static SSH_KEY_FILE_NAME = 'id_rsa';

  // ubuntu 20.04 LTS
  private static IMAGE_REF: ImageReference = {
    publisher: 'Canonical',
    offer: '0001-com-ubuntu-server-focal',
    sku: '20_04-lts-gen2',
    version: 'latest',
  };

  constructor(private azureService: CnAzureService,
              configService: CnCoreConfigService,
              commandService: CnCommandService) {
    super(commandService, configService);
  }

  getName(): CnCloudProviderName {
    return 'AZURE';
  }

  getSshKeyFileName(): string {
    return CnCloudProviderAzureService.SSH_KEY_FILE_NAME;
  }



  getSshUserName(): string {
    return 'ubuntu';
  }


  /////////////////////// INSTANCE ///////////////////////
  async createInstance(request: CnCpCreateInstanceRequest): Promise<CnCpInstance> {

    // retrieve the ssh key stored in azure
    const ssh = await this.azureService.getSshKey(this.configService.getAzureSshKey());
    const sshPublicKey: SshPublicKey = {
      path: cnServerSshAuthorizedKeyPath,
      keyData: ssh.publicKey
    };

    // eslint-disable-next-line max-len
    const subnet = `${this.azureService.getResourceGroupFullId()}/providers/Microsoft.Network/virtualNetworks/${this.configService.getAzureNetwork()}/subnets/${this.configService.getAzureNetworkSubnet()}`;

    const virtualMachine = await this.azureService.createInstance(request.name,
      request.region, request.serverName, CnCloudProviderAzureService.IMAGE_REF, sshPublicKey, subnet);

    const instance = new CnAzureInstance(virtualMachine);
    return this.getInstance(instance.id);
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

    return this.convertAzureInstance(instance);
  }

  private async getAzureInstance(id: string): Promise<CnAzureInstance> {
    const virtualMachine = await this.azureService.getInstance(id);
    return new CnAzureInstance(virtualMachine);
  }

  startInstance(id: string): Promise<void> {
    return this.azureService.startInstance(id);
  }

  stopInstance(id: string): Promise<void> {
    return this.azureService.stopInstance(id);
  }

  async getIpAddress(id: string): Promise<string> {
    const instance = await this.getAzureInstance(id);

    return (await this.azureService.getIpAddresses(instance.getNetworkId())).ipAddress;
  }

  private convertAzureInstance(instance: CnAzureInstance): CnCpInstance {
    return {
      id: instance.id,
      status: this.azureInstanceStatusToCpStatus(instance.getStatus(), instance.name),
      originalObject: instance,
      region: instance.location,
      billing: CnLabInstanceBillingMode.HOURLY,
    };
  }

  private azureInstanceStatusToCpStatus(status: CnAzureInstanceStatus, name: string): CnCpInstanceStatus {
    switch (status) {
      case 'ProvisioningState/succeeded':
      case 'ProvisioningState/creating':
      case 'ProvisioningState/failed':
      case 'ProvisioningState/updating':
      case 'PowerState/starting':
        return 'CREATING';
      case 'PowerState/running':
        return 'RUNNING';
      case 'PowerState/stopped':
      case 'PowerState/deallocated':
        return 'STOPPED';
      case 'PowerState/stopping':
      case 'PowerState/deallocating':
      case 'ProvisioningState/deleting':
        return 'STOPPING';
      default:
        throw new Error(`Unknown status ${status} for azure instance ${name}`);
    }
  }

  /////////////////////// VOLUME ///////////////////////

  async attachVolumeToInstance(instanceId: string, volumeId: string): Promise<CnCpVolume> {
    await this.azureService.attachVolume(instanceId, volumeId);

    return this.getVolume(volumeId);
  }


  async createVolume(volume: CnCpCreateVolumeRequest): Promise<CnCpVolume> {
    const disk = await this.azureService.createVolume(volume.name, volume.region,
      volume.size);

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

  async mountVolume(labInstance: CnLabInstance): Promise<void> {
    const azureInstance = await this.getAzureInstance(labInstance.serverInstanceId);

    const volume = azureInstance.getVolume();
    if (volume == null) {
      throw new Error(`No volume attached to instance ${labInstance.serverInstanceId}`);
    }

    const labSshService = this.instantiateLabSshService(labInstance);
    const mountScript = labSshService.getMountFolder() + '/' + CnCloudProviderAzureService.MOUNT_FILE;

    // call the mount script with the LUN disk number
    await labSshService.execSshCommand([`bash ${mountScript} ${volume.lun}`]);
  }


  private convertAzureVolume(disk: Disk): CnCpVolume {
    return {
      region: disk.location,
      status: this.azureVolumeStatusToCpStatus(disk.diskState as any, disk.name),
      type: CnLabInstanceVolumeType.HIGH_SPEED,
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
        return 'IN_USE';
      default:
        throw new Error(`Unknown status ${status} for azure disk ${name}`);
    }
  }


}
