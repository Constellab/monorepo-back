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
import {Injectable} from '@nestjs/common';
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
import {CnLabInstance, CnLabInstanceBillingMode, CnLabInstanceVolumeType} from '../../cn-lab-instance.entity';
import {BlBadRequestException} from '@monorepo/back-core-lib';
import {CnLabSshService} from '../cn-lab-ssh.service';

@Injectable()
export class CnCloudProviderOvhService extends CnCloudProviderService {

  private static IMAGE_NAME = 'Ubuntu 20.04';
  private static DAILY_BACKUP_CRON = '50 0 * * *'; // every day at 00:50

  private static MOUNT_FILE = 'mount_ovh.sh';
  private static MOUNT_DISK_NAME = 'sdb';

  constructor(private configService: CnCoreConfigService,
              private ovhService: CnOvhService,
              private sshService: CnLabSshService) {
    super();
  }

  getName(): CnCloudProviderName {
    return 'OVH';
  }


  public async createInstance(instance: CnCpCreateInstanceRequest): Promise<CnCpInstance> {

    // const flavorName = 'd2-2';
    const flavor = await this.ovhService.getServerInfoByRegionAndName(instance.region, instance.serverName);
    if (!flavor) {
      throw new BlBadRequestException(`The server ${instance.serverName} is not available in region ${instance.region}`);
    }

    const image = await this.ovhService.getImageByRegionAndName(instance.region, CnCloudProviderOvhService.IMAGE_NAME);
    if (!image) {
      throw new BlBadRequestException(`The ubuntu image is not available in region ${instance.region}`);
    }


    const request: CnOvhCreateInstanceRequest = {
      name: instance.name,
      region: instance.region,
      flavorId: flavor.id,
      imageId: image.id,
      sshKeyId: this.configService.getOvhSshKey(),
      monthlyBilling: instance.billing === 'MONTHLY',
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
      originalObject: instance,
      region: instance.region,
      billing: instance.monthlyBilling ? CnLabInstanceBillingMode.MONTHLY : CnLabInstanceBillingMode.HOURLY,
    };
  }


  private ovhStatusToCpStatus(status: CnOvhInstanceStatus): CnCpInstanceStatus {
    switch (status) {
      case 'ACTIVE':
        return 'RUNNING';
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
      case 'BUILD':
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
      case 'building':
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
      originalObject: volume
    };
  }

  deleteVolume(volumeId: string): Promise<void> {
    return this.ovhService.deleteVolume(volumeId);
  }

  async getIpAddress(id: string): Promise<string> {
    const instance = await this.ovhService.getInstance(id);

    const ipAddress = instance.ipAddresses.find((ip) => ip.type === 'public' && ip.version === 4);

    return ipAddress ? ipAddress.ip : null;
  }

  async volumeIsAttachedToInstance(instanceId: string, volumeId: string): Promise<boolean> {
    const volume = await this.ovhService.getVolume(volumeId);

    return volume.attachedTo != null && volume.attachedTo[0] === instanceId;
  }

  async mountVolume(labInstance: CnLabInstance): Promise<void> {
    const mountScript = this.sshService.getMountFolder() + '/' + CnCloudProviderOvhService.MOUNT_FILE;

    await this.sshService.execSshCommand(labInstance, [`bash ${mountScript} ${CnCloudProviderOvhService.MOUNT_DISK_NAME}`]);
  }

  /////////////////////////////// DNS ///////////////////////////////
  public async createDomainForLab(ipv4: string, mainDomain: string, subDomainName: string): Promise<any> {
    const request: CnOvhCreateDomainRecordRequest = {
      fieldType: 'A',
      subDomain: '*.' + subDomainName,
      target: ipv4,
    };

    return await this.ovhService.createDomainRecord(mainDomain, request);
  }

  public async labDomainRecordExists(mainDomain: string, subDomainName: string): Promise<boolean> {
    return this.ovhService.domainRecordExist(mainDomain, '*.' + subDomainName, 'A');
  }

  public async getLabDomainRecord(mainDomain: string, subDomainName: string): Promise<CnOvhDomainRecord | null> {
    const recordIds: number[] = await this.ovhService.getDomainRecordIdBySubDomain(
      mainDomain, '*.' + subDomainName, 'A');

    if (recordIds.length === 0) {
      return null;
    }

    return this.ovhService.getDomainRecord(mainDomain, recordIds[0]);
  }

  public async deleteDomainRecord(mainDomain: string, subDomainName: string): Promise<void> {
    const recordIds: number[] = await this.ovhService.getDomainRecordIdBySubDomain(mainDomain,
      '*.' + subDomainName, 'A');

    for (const recordId of recordIds) {
      await this.ovhService.deleteDomainRecord(mainDomain, recordId);
    }
  }

}
