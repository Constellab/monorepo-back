import { Injectable, Logger } from '@nestjs/common';
import { CnCloudProviderService } from '../cn-cloud-provider.service';
import { CnLab, CnLabBillingMode } from '../../cn-lab.entity';
import {
  CnCpCreateInstanceRequest,
  CnCpCreateVolumeRequest,
  CnCpInstance,
  CnCpInstanceStatus,
  CnCpVolume,
  CnCpVolumeStatus
} from '../cn-cloud-provider.class';
import { CnCloudProviderName } from '../../../cn-cloud-providers/cn-cloud-provider.entity';
import { CnOutscaleService } from './cn-outscale.service';
import { Vm } from 'outscale-api/dist/esm/models/Vm';
import { Volume } from 'outscale-api';
import { CnCoreConfigService } from '../../../cn-core/modules/cn-core-config/cn-core-config.service';
import { CnCommandService } from '../../../cn-core/services/cn-command.service';
import { CnLabVolumeType } from '../../volume/cn-lab-volume-entity';


@Injectable()
export class CnCloudProviderOutscaleService extends CnCloudProviderService {

  // object to map the REGION to the subregion
  // we always use the same subregion for a REGION
  private static regionSubRegionMapping: Record<string, string> = {
    'eu-west-2': 'eu-west-2a',
  };

  private static readonly REGION = 'eu-west-2';
  private static readonly UBUNTU_IMAGE_ID = 'ami-42e5719f';
  private static readonly MOUNT_FILE = 'mount_outscale.sh';
  private static readonly MOUNT_DISK_NAME = '/dev/sda';
  private static SSH_KEY_FILE_NAME = 'outscale_rsa';

  private readonly logger = new Logger(CnCloudProviderOutscaleService.name);


  constructor(configService: CnCoreConfigService,
              commandService: CnCommandService) {
    super(commandService, configService);
  }

  getName(): CnCloudProviderName {
    return 'OUTSCALE';
  }

  getSshUserName(): string {
    return 'outscale';
  }

  getSshKeyFileName(): string {
    return CnCloudProviderOutscaleService.SSH_KEY_FILE_NAME;
  }

  private get outscaleService(): CnOutscaleService {
    return new CnOutscaleService(CnCloudProviderOutscaleService.REGION,
      this.configService.getOutscaleAccessKey(),
      this.configService.getOutscaleSecretKey());
  }

  /////////////////////// INSTANCE ///////////////////////

  async createInstance(request: CnCpCreateInstanceRequest): Promise<CnCpInstance> {
    if (request.region !== CnCloudProviderOutscaleService.REGION) {
      throw new Error(`Region ${request.region} not supported`);
    }
    const subRegion = this.getSubRegion(request.region);

    const vm: Vm = await this.outscaleService.createInstance(CnCloudProviderOutscaleService.UBUNTU_IMAGE_ID,
      subRegion, request.serverName, this.configService.getOutscaleSshKeyName(), this.configService.getOutscaleSecurityGroup());

    await this.outscaleService.updateObjectName(vm.vmId, request.name);

    const ip = await this.outscaleService.createPublicIp();

    await this.outscaleService.updateObjectTag(ip.publicIpId, 'Name', request.name);

    // attach the ip to the instance
    // use the tag so it can be attached before the instance is running
    await this.outscaleService.updateObjectTag(vm.vmId, `osc.fcu.eip.auto-attach`, ip.publicIp);

    return this.convertInstance(vm);
  }

  async deleteInstance(id: string): Promise<void> {
    const ip = await this.outscaleService.getPublicIpByInstance(id);
    if (ip) {
      this.logger.log(`Deleting public ip ${ip.publicIpId} for instance ${id}`);
      await this.outscaleService.deletePublicIp(ip.publicIpId);
    } else {
      this.logger.error(`No public ip found for instance ${id}, skipping deletion`);
    }
    await this.outscaleService.deleteInstance(id);
  }

  async getInstance(id: string): Promise<CnCpInstance> {
    const vm = await this.outscaleService.getVm(id);
    return this.convertInstance(vm);
  }

  async getIpAddress(id: string): Promise<string> {
    const vm = await this.outscaleService.getVm(id);
    return vm.publicIp;
  }

  async startInstance(id: string): Promise<void> {
    await this.outscaleService.startInstance(id);
  }

  async stopInstance(id: string): Promise<void> {
    await this.outscaleService.stopInstance(id);
  }

  private convertInstance(vm: Vm): CnCpInstance {
    return {
      id: vm.vmId,
      status: {
        status: this.convertVmStatus(vm.state, vm.vmId),
        message: vm.stateReason
      },
      originalObject: vm,
      region: CnCloudProviderOutscaleService.REGION,
      billing: CnLabBillingMode.HOURLY,
    };
  }

  private convertVmStatus(status: string, id: string): CnCpInstanceStatus {
    // (pending | running | stopping | stopped | shutting-down | terminated | quarantine).
    switch (status) {
      // TODO check if restart = pending ?
      case 'pending':
        return 'CREATING';
      case 'running':
        return 'RUNNING';
      case 'stopping':
      case 'shutting-down':
        return 'STOPPING';
      case 'terminated':
      case 'quarantine':
      case 'stopped':
        return 'STOPPED';
      default:
        this.logger.error(`Unknown status ${status} for outscale instance ${id}`);
        return 'ERROR';
    }
  }

  /////////////////////// VOLUME ///////////////////////


  async attachVolumeToInstance(instanceId: string, volumeId: string): Promise<CnCpVolume> {
    await this.outscaleService.attachVolumeToInstance(instanceId, volumeId);
    return this.getVolume(volumeId);
  }


  async createVolume(volume: CnCpCreateVolumeRequest): Promise<CnCpVolume> {
    const subRegion = this.getSubRegion(volume.region);

    const newVolume = await this.outscaleService.createVolume(volume.size, subRegion);

    await this.outscaleService.updateObjectName(newVolume.volumeId, volume.name);

    return this.convertVolume(newVolume);
  }


  deleteVolume(volumeId: string): Promise<void> {
    return this.outscaleService.deleteVolume(volumeId);
  }

  async getVolume(volumeId: string): Promise<CnCpVolume> {
    const volume = await this.outscaleService.getVolume(volumeId);
    return this.convertVolume(volume);
  }

  async mountVolume(lab: CnLab): Promise<void> {
    const labSshService = this.instantiateLabSshService(lab);
    const mountScript = labSshService.getMountFolder() + '/' + CnCloudProviderOutscaleService.MOUNT_FILE;

    await labSshService.execSshCommand(
      [`bash ${mountScript} ${CnCloudProviderOutscaleService.MOUNT_DISK_NAME}`]);
  }

  async volumeIsAttachedToInstance(instanceId: string, volumeId: string): Promise<boolean> {
    const volume = await this.outscaleService.getVolume(volumeId);

    return volume.linkedVolumes.find(linkedVolume => linkedVolume.vmId === instanceId) != null;
  }

  private convertVolume(volume: Volume): CnCpVolume {
    return {
      id: volume.volumeId,
      size: volume.size,
      type: CnLabVolumeType.HIGH_SPEED,
      region: CnCloudProviderOutscaleService.REGION,
      originalObject: volume,
      status: this.convertVolumeStatus(volume.state)
    };
  }

  private convertVolumeStatus(status: string): CnCpVolumeStatus {
    switch (status) {
      case 'creating':
      case 'updating':
      case 'deleting':
        return 'CREATING';
      case 'available':
        return 'AVAILABLE';
      case 'in-use':
        return 'IN_USE';
      case 'attaching':
        return 'ATTACHING';
      default:
        throw new Error(`Unknown status ${status} for outscale volume`);
    }
  }


  private getSubRegion(region: string): string {
    const subRegion = CnCloudProviderOutscaleService.regionSubRegionMapping[region];
    if (!subRegion) {
      throw new Error(`No subregion found for region ${region}`);
    }
    return subRegion;
  }
}
