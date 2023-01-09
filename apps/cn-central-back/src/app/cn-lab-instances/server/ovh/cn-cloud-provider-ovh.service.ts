import {CnCloudProviderService} from '../cn-cloud-provider.service';
import {CnOvhService} from './cn-ovh.service';
import {
  CnCpCreateInstanceRequest,
  CnCpCreateVolumeRequest,
  CnCpInstance,
  CnCpInstanceStatus,
  CnCpVolume,
  CnCpVolumeStatus
} from '../cn-cloud-provider.class';
import {BadRequestException, Injectable} from '@nestjs/common';
import {
  CnOvhCreateDomainRecordRequest,
  CnOvhCreateInstanceRequest,
  CnOvhCreateVolumeRequest,
  CnOvhDomainRecord,
  CnOvhInstance,
  CnOvhInstanceStatus,
  CnOvhVolume
} from './cn-ovh.class';
import {CnCoreConfigService} from '../../../cn-core/modules/cn-core-config/cn-core-config.service';
import {CnCloudProviderName} from '../../../cn-cloud-providers/cn-cloud-provider.entity';
import {CnLabInstanceBillingMode, CnLabInstanceVolumeType} from '../../cn-lab-instance.entity';

@Injectable()
export class CnCloudProviderOvhService extends CnCloudProviderService {

  private static IMAGE_NAME = 'Ubuntu 20.04';
  private static DAILY_BACKUP_CRON = '50 0 * * *'; // every day at 00:50
  private static LAB_DOMAIN = 'gencovery.io';

  constructor(private configService: CnCoreConfigService,
              private ovhService: CnOvhService) {
    super();
  }

  getName(): CnCloudProviderName {
    return 'OVH';
  }


  public async createInstance(instance: CnCpCreateInstanceRequest): Promise<CnCpInstance> {
    if (instance.backupFrequency !== 'DAILY') {
      throw new BadRequestException(`The backup mode ${instance.backupFrequency} is not supported`);
    }

    // const flavorName = 'd2-2';
    const flavor = await this.ovhService.getServerInfoByRegionAndName(instance.region, instance.serverName);
    if (!flavor) {
      throw new BadRequestException(`The server ${instance.serverName} is not available in region ${instance.region}`);
    }

    const image = await this.ovhService.getImageByRegionAndName(instance.region, CnCloudProviderOvhService.IMAGE_NAME);
    if (!image) {
      throw new BadRequestException(`The ubuntu image is not available in region ${instance.region}`);
    }


    const request: CnOvhCreateInstanceRequest = {
      name: instance.name,
      region: instance.region,
      flavorId: flavor.id,
      imageId: image.id,
      sshKeyId: this.configService.getOvhSshKey(),
      monthlyBilling: instance.billing === 'MONTHLY',
      autobackup: {
        rotation: instance.backupRotation,
        cron: CnCloudProviderOvhService.DAILY_BACKUP_CRON,
      }

    };

    const ovhInstance = await this.ovhService.createInstance(request);

    return this.convertOvhInstance(ovhInstance);
  }

  public async getInstance(id: string): Promise<CnCpInstance> {
    const ovhInstance = await this.ovhService.getInstance(id);
    return this.convertOvhInstance(ovhInstance);
  }


  private convertOvhInstance(instance: CnOvhInstance): CnCpInstance {
    return {
      id: instance.id,
      name: instance.name,
      status: this.ovhStatusToCpStatus(instance.status),
      ipv4: this.getIpv4Address(instance),
      originalObject: instance,
      region: instance.region,
      billing: instance.monthlyBilling ? CnLabInstanceBillingMode.MONTHLY : CnLabInstanceBillingMode.HOURLY,
    };
  }

  private getIpv4Address(instance: CnOvhInstance): string | null {
    const ipAddress = instance.ipAddresses.find((ip) => ip.type === 'public' && ip.version === 4);

    return ipAddress ? ipAddress.ip : null;
  }

  private ovhStatusToCpStatus(status: CnOvhInstanceStatus): CnCpInstanceStatus {
    switch (status) {
      case 'ACTIVE':
        return 'RUNNING';
      case 'BUILD':
      case 'REBUILD':
      case 'BUILDING':
      case 'HARD_REBOOT':
      case 'REBOOT':
      case 'RESCUE':
      case 'RESCUING':
      case 'RESUMING':
      case 'RESIZE':
      case 'RESIZED':
      case 'REVERT_RESIZE':
      case 'VERIFY_RESIZE':
      case 'MIGRATING':
      case 'SNAPSHOTTING':
        return 'RESTARTING';
      case 'PASSWORD':
      case 'SHUTOFF':
      case 'SUSPENDED':
      case 'UNKNOWN':
      case 'SHELVED':
      case 'SHELVED_OFFLOADED':
      case 'PAUSED':
      case 'ERROR':
      case 'RESCUED':
      case 'UNRESCUING':
      case 'DELETED':
      case 'SOFT_DELETED':
      case 'STOPPED':
        return 'STOPPED';
      case 'SHELVING':
      case 'DELETING':
        return 'STOPPING';
      case 'UNSHELVING':
        return 'CREATING';
    }
  }

  deleteInstance(id: string): Promise<void> {
    return this.ovhService.deleteInstance(id);
  }

  startInstance(id: string): Promise<void> {
    return this.ovhService.startInstance(id);
  }

  stopInstance(id: string): Promise<void> {
    return this.ovhService.stopInstance(id);
  }


  ///////////////////////////////////////// VOLUME //////////////////////////////////////////
  public async createVolume(volume: CnCpCreateVolumeRequest): Promise<CnCpVolume> {
    const request: CnOvhCreateVolumeRequest = {
      region: volume.region,
      size: volume.size,
      type: volume.type === 'CLASSIC' ? 'classic' : 'high-speed-gen2',
      name: volume.name,
      description: volume.description
    };

    const ovhVolume = await this.ovhService.createVolume(request);
    return this.convertVolume(ovhVolume);
  }

  public async attachVolumeToInstance(instanceId: string, volumeId: string): Promise<CnCpVolume> {
    const ovhVolume = await this.ovhService.attachVolumeToInstance(instanceId, volumeId);
    return this.convertVolume(ovhVolume);
  }

  public async getVolume(volumeId: string): Promise<CnCpVolume> {
    const ovhVolume = await this.ovhService.getVolume(volumeId);
    return this.convertVolume(ovhVolume);
  }

  private convertVolume(volume: CnOvhVolume): CnCpVolume {
    let volumeStatus: CnCpVolumeStatus;
    switch (volume.status) {
      case 'creating':
        volumeStatus = 'CREATING';
        break;
      case 'available':
        volumeStatus = 'AVAILABLE';
        break;
      case 'in-use':
        volumeStatus = 'IN_USE';
        break;
      case 'reserved':
        volumeStatus = 'ATTACHING';
        break;
    }

    let volumeType: CnLabInstanceVolumeType;
    switch (volume.type) {
      case 'classic':
        volumeType = CnLabInstanceVolumeType.CLASSIC;
        break;
      case 'high-speed':
      case 'high-speed-gen2':
        volumeType = CnLabInstanceVolumeType.HIGH_SPEED;
        break;
    }

    return {
      id: volume.id,
      name: volume.name,
      region: volume.region,
      size: volume.size,
      status: volumeStatus,
      type: volumeType,
      attachedTo: volume.attachedTo != null ? volume.attachedTo[0] : null,
      originalObject: volume
    };
  }

  deleteVolume(volumeId: string): Promise<void> {
    return this.ovhService.deleteVolume(volumeId);
  }


  /////////////////////////////// DNS ///////////////////////////////
  public async createDomainForLab(ipv4: string, subDomain: string): Promise<any> {
    const request: CnOvhCreateDomainRecordRequest = {
      fieldType: 'A',
      subDomain: subDomain,
      target: ipv4,
    };

    return await this.ovhService.createDomainRecord(CnCloudProviderOvhService.LAB_DOMAIN, request);
  }

  public async labDomainRecordExists(subDomain: string): Promise<boolean> {
    return this.ovhService.domainRecordExist(CnCloudProviderOvhService.LAB_DOMAIN, subDomain, 'A');
  }

  public async getLabDomainRecord(subDomain: string): Promise<CnOvhDomainRecord | null> {
    const recordIds: number[] = await this.ovhService.getDomainRecordIdBySubDomain(CnCloudProviderOvhService.LAB_DOMAIN, subDomain, 'A');

    if (recordIds.length === 0) {
      return null;
    }

    return this.ovhService.getDomainRecord(CnCloudProviderOvhService.LAB_DOMAIN, recordIds[0]);
  }

  public async deleteDomainRecord(subDomain: string): Promise<void> {
    const recordIds: number[] = await this.ovhService.getDomainRecordIdBySubDomain(CnCloudProviderOvhService.LAB_DOMAIN, subDomain, 'A');

    for (const recordId of recordIds) {
      await this.ovhService.deleteDomainRecord(CnCloudProviderOvhService.LAB_DOMAIN, recordId);
    }
  }

}
