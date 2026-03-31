import { BlBadRequestException } from '@monorepo/back-core-lib';
import { Injectable, Logger } from '@nestjs/common';

import { CnCloudProviderName } from '../../../cn-cloud-providers/cn-cloud-provider.entity';
import { CnCoreConfigService } from '../../../cn-core/modules/cn-core-config/cn-core-config.service';
import { CnCommandService } from '../../../cn-core/services/cn-command.service';
import { CnLab, CnLabBillingMode } from '../../cn-lab.entity';
import { CnLabVolumeType } from '../../volume/cn-lab-volume-entity';
import {
  CnCpCreateInstanceRequest,
  CnCpCreateVolumeRequest,
  CnCpInstance,
  CnCpInstanceStatus,
  CnCpInstanceWithVolume,
  CnCpVolume,
  CnCpVolumeStatus,
} from '../cn-cloud-provider.class';
import { CnCloudProviderService } from '../cn-cloud-provider.service';
import {
  CnDomainFieldType,
  CnOvhCreateDomainRecordRequest,
  CnOvhCreateInstanceRequest,
  CnOvhCreateVolumeRequest,
  CnOvhDomainRecord,
  CnOvhInstance,
  CnOvhInstanceStatus,
  CnOvhVolume,
} from './cn-ovh.class';
import { CnOvhService } from './cn-ovh.service';

@Injectable()
export class CnCloudProviderOvhService extends CnCloudProviderService {
  private readonly logger = new Logger(CnCloudProviderOvhService.name);

  private static IMAGE_NAME = 'Ubuntu 20.04';

  private static MOUNT_FILE = 'mount_ovh.sh';
  private static MOUNT_DISK_NAME = 'sdb';
  private static DNS_HOST_RECORD: CnDomainFieldType = 'A';
  private static DNS_CHALLENGE_RECORD: CnDomainFieldType = 'TXT';
  private static DNS_CHALLENGE_PREFIX = '_acme-challenge';
  private static DNS_CHALLENGE_TTL = 60; // 1 minute

  constructor(
    private ovhService: CnOvhService,
    configService: CnCoreConfigService,
    commandService: CnCommandService
  ) {
    super(commandService, configService);
  }

  getName(): CnCloudProviderName {
    return 'OVH';
  }

  getSshUserName(): string {
    return 'ubuntu';
  }

  getSshPrivateKeyFilePath(): string {
    return this.configService.getMainSshPrivateKeyFilePath();
  }

  public async createInstance(instance: CnCpCreateInstanceRequest): Promise<CnCpInstance> {
    // const flavorName = 'd2-2';
    const flavor = await this.ovhService.getServerInfoByRegionAndName(instance.region, instance.serverName);
    if (!flavor) {
      throw new BlBadRequestException(
        `The server ${instance.serverName} is not available in region ${instance.region}`
      );
    }

    const image = await this.ovhService.getImageByRegionAndName(
      instance.region,
      CnCloudProviderOvhService.IMAGE_NAME
    );
    if (!image) {
      throw new BlBadRequestException(`The ubuntu image is not available in region ${instance.region}`);
    }

    const request: CnOvhCreateInstanceRequest = {
      name: instance.name,
      region: instance.region,
      flavorId: flavor.id,
      imageId: image.id,
      sshKeyId: this.configService.getOvhSshKey(),
      monthlyBilling: instance.billing === CnLabBillingMode.MONTHLY,
    };

    const ovhInstance = await this.ovhService.createInstance(request);

    return this.convertOvhInstance(ovhInstance);
  }

  createInstanceWithVolume(): Promise<CnCpInstanceWithVolume> {
    // the volume is created separately so this is not called
    throw new Error('Not implemented');
  }

  public async getInstance(id: string): Promise<CnCpInstance> {
    const ovhInstance = await this.ovhService.getInstance(id);
    return this.convertOvhInstance(ovhInstance);
  }

  private convertOvhInstance(instance: CnOvhInstance): CnCpInstance {
    return {
      id: instance.id,
      status: {
        status: this.ovhStatusToCpStatus(instance.status, instance.id),
        message: null,
      },
      originalObject: instance,
      region: instance.region,
      billing: instance.monthlyBilling ? CnLabBillingMode.MONTHLY : CnLabBillingMode.HOURLY,
    };
  }

  private ovhStatusToCpStatus(status: CnOvhInstanceStatus, id: string): CnCpInstanceStatus {
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
      case 'SHELVED':
      case 'SHELVED_OFFLOADED':
      case 'PAUSED':
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
      case 'ERROR':
      case 'UNKNOWN':
        return 'ERROR';
      default:
        this.logger.error(`Unknown status ${status as any} for ovh instance ${id}`);
        return 'ERROR';
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
  volumeIsCreatedSeparately(): boolean {
    return true;
  }

  public async createVolume(volume: CnCpCreateVolumeRequest): Promise<CnCpVolume> {
    const request: CnOvhCreateVolumeRequest = {
      region: volume.region,
      size: volume.size,
      type: volume.type === CnLabVolumeType.CLASSIC ? 'classic' : 'high-speed-gen2',
      name: volume.name,
      description: volume.description,
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

    let volumeType: CnLabVolumeType;
    switch (volume.type) {
      case 'classic':
        volumeType = CnLabVolumeType.CLASSIC;
        break;
      case 'high-speed':
      case 'high-speed-gen2':
        volumeType = CnLabVolumeType.HIGH_SPEED;
        break;
    }

    return {
      id: volume.id,
      region: volume.region,
      size: volume.size,
      status: volumeStatus,
      type: volumeType,
      originalObject: volume,
    };
  }

  deleteVolume(volumeId: string): Promise<void> {
    return this.ovhService.deleteVolume(volumeId);
  }

  async volumeIsAttachedToInstance(instanceId: string, volumeId: string): Promise<boolean> {
    const volume = await this.ovhService.getVolume(volumeId);

    return volume.attachedTo != null && volume.attachedTo[0] === instanceId;
  }

  async mountVolume(lab: CnLab): Promise<void> {
    const sshService = this.instantiateLabSshService(lab);

    const mountScript = sshService.getMountFolder() + '/' + CnCloudProviderOvhService.MOUNT_FILE;

    await sshService.execSshCommand([`bash ${mountScript} ${CnCloudProviderOvhService.MOUNT_DISK_NAME}`]);
  }

  /////////////////////////////// IP ADDRESS ///////////////////////////////

  deleteIpAddress(): Promise<void> {
    return null;
  }

  async getIpAddressFromInstanceId(id: string): Promise<string> {
    const instance = await this.ovhService.getInstance(id);

    const ipAddress = instance.ipAddresses.find((ip) => ip.type === 'public' && ip.version === 4);

    return ipAddress ? ipAddress.ip : null;
  }

  /////////////////////////////// LAB DNS ///////////////////////////////
  public async createLabDomainHostRecord(
    ipv4: string,
    mainDomain: string,
    subDomainName: string
  ): Promise<any> {
    const request: CnOvhCreateDomainRecordRequest = {
      fieldType: CnCloudProviderOvhService.DNS_HOST_RECORD,
      subDomain: this.getSubDomainRecordName(subDomainName),
      target: ipv4,
    };

    return await this.ovhService.createDomainRecord(mainDomain, request);
  }

  public async labDomainRecordExists(mainDomain: string, subDomainName: string): Promise<boolean> {
    return this.ovhService.domainRecordExist(
      mainDomain,
      this.getSubDomainRecordName(subDomainName),
      CnCloudProviderOvhService.DNS_HOST_RECORD
    );
  }

  public async getLabDomainHostRecord(
    mainDomain: string,
    subDomainName: string
  ): Promise<CnOvhDomainRecord | null> {
    const recordIds: number[] = await this.ovhService.getDomainRecordIdBySubDomain(
      mainDomain,
      this.getSubDomainRecordName(subDomainName),
      CnCloudProviderOvhService.DNS_HOST_RECORD
    );

    if (recordIds.length === 0) {
      return null;
    }

    return this.ovhService.getDomainRecord(mainDomain, recordIds[0]);
  }

  /**
   * Update the DNS A record for a lab if the IP has changed, or create it if it doesn't exist.
   */
  public async updateOrCreateLabDomainHostRecord(
    ipv4: string,
    mainDomain: string,
    subDomainName: string
  ): Promise<void> {
    const recordIds: number[] = await this.ovhService.getDomainRecordIdBySubDomain(
      mainDomain,
      this.getSubDomainRecordName(subDomainName),
      CnCloudProviderOvhService.DNS_HOST_RECORD
    );

    if (recordIds.length > 0) {
      const existingRecord = await this.ovhService.getDomainRecord(mainDomain, recordIds[0]);
      if (existingRecord.target === ipv4) {
        return;
      }
      await this.ovhService.updateDomainRecord(mainDomain, recordIds[0], ipv4);
      return;
    }

    await this.createLabDomainHostRecord(ipv4, mainDomain, subDomainName);
  }

  public async deleteLabDomainHostRecord(mainDomain: string, subDomainName: string): Promise<void> {
    return this.deleteDomainRecord(
      mainDomain,
      this.getSubDomainRecordName(subDomainName),
      CnCloudProviderOvhService.DNS_HOST_RECORD
    );
  }

  private getSubDomainRecordName(subDomainName: string): string {
    return '*.' + subDomainName;
  }

  /////////////////////////////// DNS CHALLENGE ///////////////////////////////
  public async createDnsChallengeForLab(
    mainDomain: string,
    subDomainName: string,
    challengeTxt: string
  ): Promise<void> {
    const challengeSubdomain = `${CnCloudProviderOvhService.DNS_CHALLENGE_PREFIX}.${subDomainName}`;
    await this.ovhService.createDomainRecord(mainDomain, {
      subDomain: challengeSubdomain,
      fieldType: CnCloudProviderOvhService.DNS_CHALLENGE_RECORD,
      ttl: CnCloudProviderOvhService.DNS_CHALLENGE_TTL,
      target: challengeTxt,
    });
  }

  public async deleteDnsChallengeForLab(mainDomain: string, subDomainName: string): Promise<void> {
    const challengeSubdomain = `${CnCloudProviderOvhService.DNS_CHALLENGE_PREFIX}.${subDomainName}`;
    await this.deleteDomainRecord(
      mainDomain,
      challengeSubdomain,
      CnCloudProviderOvhService.DNS_CHALLENGE_RECORD
    );
  }

  /////////////////////////////// GENERIC DNS ///////////////////////////////

  private async deleteDomainRecord(
    mainDomain: string,
    subDomainName: string,
    fieldType: CnDomainFieldType
  ): Promise<void> {
    const recordIds: number[] = await this.ovhService.getDomainRecordIdBySubDomain(
      mainDomain,
      subDomainName,
      fieldType
    );

    for (const recordId of recordIds) {
      await this.ovhService.deleteDomainRecord(mainDomain, recordId);
    }
  }
}
