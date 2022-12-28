import {BadRequestException, Injectable, Logger} from '@nestjs/common';
import {CnCloudProviderName} from '../../cn-cloud-providers/cn-cloud-provider.entity';
import {CnCloudProviderOvhService} from './ovh/cn-cloud-provider-ovh.service';
import {CnCloudProviderExternalService} from './cn-cloud-provider-external.service';
import {
  CnCpBackupFrequency,
  CnCpBillingType,
  CnCpCompleteInfo,
  CnCpCreateInstanceRequest,
  CnCpCreateVolumeRequest,
  CnCpInstance,
  CnCpVolume,
  CnCpVolumeType
} from './cn-cloud-provider-external.class';
import {CnLabInstance} from '../cn-lab-instance.entity';
import {CnLabInstancesService} from '../cn-lab-instances.service';
import {CnLabInstanceStatus} from '../status/cn-lab-instance-status.enum';


@Injectable()
export class CnLabCloudProviderService {

  private static readonly BACKUP_ROTATION = 7;
  private static readonly BACKUP_FREQUENCY: CnCpBackupFrequency = 'DAILY';

  private readonly logger = new Logger(CnLabCloudProviderService.name);


  constructor(private ovhCloudProviderService: CnCloudProviderOvhService,
              private labInstanceService: CnLabInstancesService) {
  }

  public async getCompleteInfo(labInstance: CnLabInstance,
                               cloudProvider: CnCloudProviderName): Promise<CnCpCompleteInfo> {
    const cloudProviderService = this.getCloudProviderService(cloudProvider);

    const info: CnCpCompleteInfo = {
      instance: null,
      volume: null,
      domainRecord: null
    };

    const promises = [];
    if (labInstance.serverInstanceId) {
      promises.push(cloudProviderService.getInstance(labInstance.serverInstanceId)
        .then((instance) => info.instance = instance)
        .catch(err => this.logger.error(err)));
    }

    if (labInstance.serverVolumeId) {
      promises.push(cloudProviderService.getVolume(labInstance.serverVolumeId)
        .then((volume) => info.volume = volume)
        .catch(err => this.logger.error(err)));
    }

    info.domainRecord = await this.ovhCloudProviderService.getLabDomainRecord(labInstance.getSubDomainDsnRecord());
    promises.push(this.ovhCloudProviderService.getLabDomainRecord(labInstance.getSubDomainDsnRecord())
      .then((domainRecord) => info.domainRecord = domainRecord)
      .catch(err => this.logger.error(err)));

    return Promise.all(promises).then(() => info);
  }

  /**
   * Function to init the server instance in the cloud provider
   * It creates the instance if it doesn't exist
   * It creates the volume if it doesn't exist
   * It attaches the volume to the instance if not attached
   * It creates the domain record if it doesn't exist
   */
  public async initInstance(labInstance: CnLabInstance,
                            cloudProvider: CnCloudProviderName,
                            region: string,
                            billing: CnCpBillingType,
                            volumeSize: number,
                            volumeType: CnCpVolumeType): Promise<CnLabInstance> {

    const cloudProviderService = this.getCloudProviderService(cloudProvider);

    let serverInstance: CnCpInstance;

    if (labInstance.serverInstanceId == null) {
      // Creating the server instance
      serverInstance = await this.createLabInstance(cloudProviderService, labInstance, region, billing);
      labInstance.serverInstanceId = serverInstance.id;
      labInstance = await this.labInstanceService.update(labInstance);
    } else {
      serverInstance = await cloudProviderService.getInstance(labInstance.serverInstanceId);
      if (serverInstance == null) {
        throw new BadRequestException(`Server instance ${labInstance.serverInstanceId} not found in cloud provider ${cloudProvider}`);
      }
      this.logger.log(`Server instance ${labInstance.serverInstanceId} already exists for lab ${labInstance.id}. Skipping creation`);
    }

    let volume: CnCpVolume;

    if (labInstance.serverVolumeId == null) {
      // Creating the volume
      volume = await this.createVolume(cloudProviderService, labInstance, region, volumeSize, volumeType);
      labInstance.serverVolumeId = volume.id;
      labInstance = await this.labInstanceService.update(labInstance);
    } else {
      volume = await cloudProviderService.getVolume(labInstance.serverVolumeId);
      if (volume == null) {
        throw new BadRequestException(`Volume ${labInstance.serverVolumeId} not found in cloud provider ${cloudProvider}`);
      }
      this.logger.log(`Volume ${labInstance.serverVolumeId} already exists for lab ${labInstance.id}. Skipping creation`);
    }

    // Waiting for the server and the volume to be ready
    let count = 0;
    while ((serverInstance.status === 'CREATING' || volume.status === 'CREATING') && count < 10) {
      // wait 30 seconds
      // eslint-disable-next-line max-len
      this.logger.log(`Waiting for instance ${serverInstance.id} and volume ${volume.id} to be ready for lab ${labInstance.id} in cloud provider ${cloudProvider}. Count: ${count}`);
      await new Promise(r => setTimeout(r, 30000));

      // refresh lab instance if needed
      if (serverInstance.status !== 'RUNNING') {
        serverInstance = await this.getCloudProviderService(cloudProvider).getInstance(serverInstance.id);
      }

      // refresh volume if needed
      if (volume.status !== 'AVAILABLE') {
        volume = await this.getCloudProviderService(cloudProvider).getVolume(volume.id);
      }

      count++;
    }

    if (serverInstance.status === 'CREATING') {
      throw new BadRequestException('Instance not ready');
    }
    if (volume.status === 'CREATING') {
      throw new BadRequestException('Volume not ready');
    }

    // Attaching the volume to the server
    if (volume.status === 'AVAILABLE') {
      await this.attachVolumeToInstance(cloudProviderService, serverInstance.id, volume.id, labInstance.id);
    } else {
      // check that the volume is attached to the instance
      if (volume.attachedTo !== serverInstance.id) {
        // eslint-disable-next-line max-len
        throw new BadRequestException(`For lab ${labInstance.id}, volume ${volume.id} is not attached to instance ${serverInstance.id} but to '${volume.attachedTo}'`);
      }
      this.logger.log(`Volume ${volume.id} was already attached to lab ${labInstance.id}. Skipping attachment`);
    }

    // create domain record
    await this.createDomainRecordForLab(labInstance, serverInstance.ipv4);

    return labInstance;
  }

  private async createLabInstance(service: CnCloudProviderExternalService, labInstance: CnLabInstance,
                                  region: string, billing: CnCpBillingType): Promise<CnCpInstance> {
    // eslint-disable-next-line max-len
    this.logger.log(`Creating instance ${labInstance.name} ${labInstance.serverInfo.name} for lab ${labInstance.id} in cloud provider ${service.getName()}`);
    const instanceRequest: CnCpCreateInstanceRequest = {
      name: labInstance.name,
      region: region,
      serverName: labInstance.serverInfo.name,
      billing: billing,
      backupFrequency: CnLabCloudProviderService.BACKUP_FREQUENCY,
      backupRotation: CnLabCloudProviderService.BACKUP_ROTATION
    };
    const serverInstance = await service.createInstance(instanceRequest);
    this.logger.log(`Instance ${serverInstance.id} created in for lab ${labInstance.id} in cloud provider ${service.getName()}`);
    return serverInstance;
  }

  private async createVolume(service: CnCloudProviderExternalService, labInstance: CnLabInstance,
                             region: string, volumeSize: number,
                             volumeType: CnCpVolumeType): Promise<CnCpVolume> {
    const volumeRequest: CnCpCreateVolumeRequest = {
      name: labInstance.name,
      description: 'Volume for lab ' + labInstance.name,
      size: volumeSize,
      type: volumeType,
      region: region
    };
    this.logger.log(`Creating volume for lab ${labInstance.id} in cloud provider ${service.getName()}`);
    const volume = await service.createVolume(volumeRequest);
    this.logger.log(`Volume ${volume.id} created for lab ${labInstance.id} in cloud provider ${service.getName()}`);
    return volume;
  }

  private async createDomainRecordForLab(labInstance: CnLabInstance, ipv4: string): Promise<void> {
    const subDomain = labInstance.getSubDomainDsnRecord();

    const domainExists = await this.ovhCloudProviderService.labDomainRecordExists(subDomain);
    // check if the domain record already exists
    if (domainExists) {
      this.logger.log(`Domain record ${subDomain} for lab ${labInstance.id} already exists, skipping creation`);
      return;
    }

    if (!ipv4) {
      throw new BadRequestException(`No IP address for lab ${labInstance.id} with server id ${labInstance.serverInstanceId}`);
    }

    this.logger.log(`Creating domain record for lab ${labInstance.id} with subdomain ${subDomain}`);
    await this.ovhCloudProviderService.createDomainForLab(ipv4, subDomain);
    this.logger.log(`Domain record created for lab ${labInstance.id} with subdomain ${subDomain}`);
  }

  private async attachVolumeToInstance(service: CnCloudProviderExternalService, serverInstanceId: string, volumeId: string,
                                       labInstanceId: string): Promise<CnCpVolume> {
    // eslint-disable-next-line max-len
    this.logger.log(`Attaching volume ${volumeId} to instance ${serverInstanceId} for lab ${labInstanceId} in cloud provider ${service.getName()}`);
    const volume = await service.attachVolumeToInstance(serverInstanceId, volumeId);
    // eslint-disable-next-line max-len
    this.logger.log(`Volume ${volume.id} attached to instance ${serverInstanceId} for lab ${labInstanceId} in cloud provider ${service.getName()}`);
    return volume;
  }


  private getCloudProviderService(cloudProvider: CnCloudProviderName): CnCloudProviderExternalService {
    switch (cloudProvider) {
      case 'OVH':
        return this.ovhCloudProviderService;
      default:
        throw new BadRequestException(`Cloud provider ${cloudProvider} not supported`);
    }
  }


  public async deleteLabInstanceServerAndVolume(labInstanceId: string,
                                                cloudProvider: CnCloudProviderName): Promise<void> {
    const labInstance = await this.labInstanceService.findByIdAndCheck(labInstanceId);
    const cloudProviderService = this.getCloudProviderService(cloudProvider);

    if (labInstance.serverInstanceId) {
      this.logger.log(`Deleting server instance ${labInstance.serverInstanceId} for lab ${labInstance.id}`);
      await cloudProviderService.deleteInstance(labInstance.serverInstanceId);
      this.logger.log(`Server instance ${labInstance.serverInstanceId} deleted for lab ${labInstance.id}`);
    } else {
      this.logger.log(`No server instance for lab ${labInstance.id}`);
    }

    if (labInstance.serverVolumeId) {
      this.logger.log(`Deleting volume ${labInstance.serverVolumeId} for lab ${labInstance.id}`);
      await cloudProviderService.deleteVolume(labInstance.serverVolumeId);
      this.logger.log(`Volume ${labInstance.serverVolumeId} deleted for lab ${labInstance.id}`);
    } else {
      this.logger.log(`No volume for lab ${labInstance.id}. Skipping deletion`);
    }

    this.logger.log(`Deleting domain record ${labInstance.getSubDomainDsnRecord()} for lab ${labInstance.id}`);
    await this.ovhCloudProviderService.deleteDomainRecord(labInstance.getSubDomainDsnRecord());

    labInstance.serverVolumeId = null;
    labInstance.serverInstanceId = null;
    await this.labInstanceService.update(labInstance);

    if (labInstance.currentStatus.status !== CnLabInstanceStatus.STOPPED) {
      // update lab instance status
      await this.labInstanceService.updateCurrentStatus(CnLabInstanceStatus.STOPPED, labInstance.id);
    }
  }
}
