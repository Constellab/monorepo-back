import {BadRequestException, Injectable, Logger} from '@nestjs/common';
import {CnCloudProviderName} from '../../cn-cloud-providers/cn-cloud-provider.entity';
import {CnCloudProviderOvhService} from './ovh/cn-cloud-provider-ovh.service';
import {CnCloudProviderService} from './cn-cloud-provider.service';
import {
  CnCpBackupFrequency,
  CnCpBillingType,
  CnCpCompleteInfo,
  CnCpCreateInstanceRequest,
  CnCpCreateVolumeRequest,
  CnCpInstance,
  CnCpInstanceStatus,
  CnCpVolume,
  CnCpVolumeType
} from './cn-cloud-provider.class';
import {CnLabInstance} from '../cn-lab-instance.entity';
import {CnLabInstancesService} from '../cn-lab-instances.service';
import {CnLabInstanceStatus} from '../status/cn-lab-instance-status.enum';

/**
 * Service to manage the lab server via the cloud provider
 */
@Injectable()
export class CnLabServerService {

  private static readonly BACKUP_ROTATION = 7;
  private static readonly BACKUP_FREQUENCY: CnCpBackupFrequency = 'DAILY';

  private readonly logger = new Logger(CnLabServerService.name);


  constructor(private ovhCloudProviderService: CnCloudProviderOvhService,
              private labInstanceService: CnLabInstancesService) {
  }

  public async getCompleteInfo(labInstance: CnLabInstance): Promise<CnCpCompleteInfo> {
    const cloudProviderService = this.getCloudProviderService(labInstance.getCloudProviderName());

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
                            billing: CnCpBillingType,
                            volumeSize: number,
                            volumeType: CnCpVolumeType): Promise<CnLabInstance> {

    const cloudProviderName = labInstance.getCloudProviderName();
    const regionName = labInstance.region.technicalName;
    const cloudProviderService = this.getCloudProviderService(cloudProviderName);

    let serverInstance: CnCpInstance;

    if (!labInstance.serverInstanceId) {
      // Creating the server instance
      serverInstance = await this.createLabInstance(cloudProviderService, labInstance, regionName, billing);
      labInstance.serverInstanceId = serverInstance.id;
      labInstance = await this.labInstanceService.update(labInstance);
    } else {
      serverInstance = await cloudProviderService.getInstance(labInstance.serverInstanceId);
      if (serverInstance == null) {
        throw new BadRequestException(`Server instance ${labInstance.serverInstanceId} not found in cloud provider ${cloudProviderName}`);
      }
      this.logger.log(`Server instance ${labInstance.serverInstanceId} already exists for lab ${labInstance.id}. Skipping creation`);
    }

    let volume: CnCpVolume;

    if (!labInstance.serverVolumeId) {
      // Creating the volume
      volume = await this.createVolume(cloudProviderService, labInstance, regionName, volumeSize, volumeType);
      labInstance.serverVolumeId = volume.id;
      labInstance = await this.labInstanceService.update(labInstance);
    } else {
      volume = await cloudProviderService.getVolume(labInstance.serverVolumeId);
      if (volume == null) {
        throw new BadRequestException(`Volume ${labInstance.serverVolumeId} not found in cloud provider ${cloudProviderName}`);
      }
      this.logger.log(`Volume ${labInstance.serverVolumeId} already exists for lab ${labInstance.id}. Skipping creation`);
    }


    // Waiting for the server and the volume to be ready
    let count = 0;
    while ((serverInstance.status === 'CREATING' || volume.status === 'CREATING') && count < 10) {

      if (count === 0) {
        await this.labInstanceService.updateServerStatusText(labInstance.id, `Waiting for server and volume to be ready`);
      }
      // wait 30 seconds
      // eslint-disable-next-line max-len
      this.logger.log(`Waiting for instance ${serverInstance.id} and volume ${volume.id} to be ready for lab ${labInstance.id} in cloud provider ${cloudProviderName}. Count: ${count}`);
      await new Promise(r => setTimeout(r, 30000));

      // refresh lab instance if needed
      if (serverInstance.status !== 'RUNNING') {
        serverInstance = await this.getCloudProviderService(cloudProviderName).getInstance(serverInstance.id);
      }

      // refresh volume if needed
      if (volume.status !== 'AVAILABLE') {
        volume = await this.getCloudProviderService(cloudProviderName).getVolume(volume.id);
      }

      count++;
    }

    if (serverInstance.status === 'CREATING') {
      await this.labInstanceService.updateServerStatusText(labInstance.id,
        'Server instance not ready, please refresh the status if few minutes and then contact the support if the problem persists');
      throw new BadRequestException('Instance not ready');
    }
    if (volume.status === 'CREATING') {
      await this.labInstanceService.updateServerStatusText(labInstance.id,
        'Volume not ready, please refresh the status if few minutes and then contact the support if the problem persists');
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

  private async createLabInstance(service: CnCloudProviderService, labInstance: CnLabInstance,
                                  region: string, billing: CnCpBillingType): Promise<CnCpInstance> {
    await this.labInstanceService.updateServerStatusText(labInstance.id,
      `Creating server instance ${labInstance.serverInfo.name} in cloud provider ${service.getName()}`
    );
    // eslint-disable-next-line max-len
    this.logger.log(`Creating server instance ${labInstance.name} ${labInstance.serverInfo.name} for lab ${labInstance.id} in cloud provider ${service.getName()}`);
    const instanceRequest: CnCpCreateInstanceRequest = {
      name: labInstance.name,
      region: region,
      serverName: labInstance.serverInfo.name,
      billing: billing,
      backupFrequency: CnLabServerService.BACKUP_FREQUENCY,
      backupRotation: CnLabServerService.BACKUP_ROTATION
    };
    const serverInstance = await service.createInstance(instanceRequest);
    this.logger.log(`Instance ${serverInstance.id} created in for lab ${labInstance.id} in cloud provider ${service.getName()}`);
    return serverInstance;
  }

  private async createVolume(service: CnCloudProviderService, labInstance: CnLabInstance,
                             region: string, volumeSize: number,
                             volumeType: CnCpVolumeType): Promise<CnCpVolume> {
    const volumeRequest: CnCpCreateVolumeRequest = {
      name: labInstance.name,
      description: 'Volume for lab ' + labInstance.name,
      size: volumeSize,
      type: volumeType,
      region: region
    };

    await this.labInstanceService.updateServerStatusText(labInstance.id,
      `Creating volume in cloud provider ${service.getName()}`
    );
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
      await this.labInstanceService.updateServerStatusText(labInstance.id,
        'The ip adresse of the server is not available, please retry in few minutes and contact the support if the problem persists');
      throw new BadRequestException(`No IP address for lab ${labInstance.id} with server id ${labInstance.serverInstanceId}`);
    }

    await this.labInstanceService.updateServerStatusText(labInstance.id, 'Creating DNS record for the lab');
    this.logger.log(`Creating domain record for lab ${labInstance.id} with subdomain ${subDomain}`);
    await this.ovhCloudProviderService.createDomainForLab(ipv4, subDomain);
    this.logger.log(`Domain record created for lab ${labInstance.id} with subdomain ${subDomain}`);
  }

  private async attachVolumeToInstance(service: CnCloudProviderService, serverInstanceId: string, volumeId: string,
                                       labInstanceId: string): Promise<CnCpVolume> {
    await this.labInstanceService.updateServerStatusText(labInstanceId, 'Attaching volume to server instance');
    // eslint-disable-next-line max-len
    this.logger.log(`Attaching volume ${volumeId} to instance ${serverInstanceId} for lab ${labInstanceId} in cloud provider ${service.getName()}`);
    const volume = await service.attachVolumeToInstance(serverInstanceId, volumeId);
    // eslint-disable-next-line max-len
    this.logger.log(`Volume ${volume.id} attached to instance ${serverInstanceId} for lab ${labInstanceId} in cloud provider ${service.getName()}`);
    return volume;
  }


  public async deleteLabInstanceServerAndVolume(labInstance: CnLabInstance): Promise<void> {
    const cloudProviderService = this.getCloudProviderService(labInstance.getCloudProviderName());

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

  public async startLab(labInstance: CnLabInstance): Promise<CnLabInstance> {
    if (!labInstance.serverInstanceId) {
      throw new BadRequestException(`Lab has no server instance was it correctly initialized?`);
    }

    const cloudProviderService = this.getCloudProviderService(labInstance.getCloudProviderName());

    const serverInstance = await cloudProviderService.getInstance(labInstance.serverInstanceId);

    // if the server is running
    if (serverInstance.status === 'RUNNING') {
      //set lab instance to running if it is not already
      if (labInstance.currentStatus.status !== CnLabInstanceStatus.RUNNING) {
        this.logger.log(`Refreshing lab ${labInstance.id} status to running`);
        return await this.labInstanceService.markInstanceAsRunning(labInstance.id);
      } else {
        throw new BadRequestException(`Lab is already running`);
      }
    }

    if (serverInstance.status === 'CREATING' || serverInstance.status === 'RESTARTING' || serverInstance.status === 'STOPPING') {
      throw new BadRequestException(`Lab is currently ${serverInstance.status}`);
    }

    // if the server is stopped
    await cloudProviderService.startInstance(labInstance.serverInstanceId);
    labInstance = await this.labInstanceService.markInstanceAsStarting(labInstance.id);

    this.checkServerNotBusyAsync(labInstance);
    return labInstance;
  }

  public async stopLab(labInstance: CnLabInstance): Promise<CnLabInstance> {
    if (!labInstance.serverInstanceId) {
      throw new BadRequestException(`Lab has no server instance was it correctly initialized?`);
    }

    const cloudProviderService = this.getCloudProviderService(labInstance.getCloudProviderName());

    const serverInstance = await cloudProviderService.getInstance(labInstance.serverInstanceId);

    // if the server is stopped
    if (serverInstance.status === 'STOPPED') {
      //set lab instance to stopped if it is not already
      if (labInstance.currentStatus.status !== CnLabInstanceStatus.STOPPED) {
        this.logger.log(`Refreshing lab ${labInstance.id} status to stopped`);
        return await this.labInstanceService.markInstanceAsStopped(labInstance.id);
      } else {
        throw new BadRequestException(`Lab is already stopped`);
      }
    }

    if (serverInstance.status === 'CREATING' || serverInstance.status === 'RESTARTING' || serverInstance.status === 'STOPPING') {
      throw new BadRequestException(`Lab is currently ${serverInstance.status}`);
    }

    // if the server is running
    await cloudProviderService.stopInstance(labInstance.serverInstanceId);
    labInstance = await this.labInstanceService.markInstanceAsStopping(labInstance.id);

    this.checkServerNotBusyAsync(labInstance);
    return labInstance;
  }

  private checkServerNotBusyAsync(labInstance: CnLabInstance): void {
    this.checkForServerToBeNotBusy(labInstance.id).catch(
      error => this.logger.error(`Lab ${labInstance.id} is busy. Cannot start lab. Error: ${error}`)
    );
  }

  private async checkForServerToBeNotBusy(labInstanceId: string): Promise<void> {

    // Waiting for the server and the volume to be ready
    let count = 0;
    while (count <= 20) {
      // wait for 30 seconds
      await new Promise(r => setTimeout(r, 30000));

      this.logger.log(`Checking if server of lab ${labInstanceId} is ready`);
      const labInstance = await this.refreshLabStatus(labInstanceId);


      if (labInstance.currentStatus.status === CnLabInstanceStatus.RUNNING ||
        labInstance.currentStatus.status === CnLabInstanceStatus.STOPPED) {
        return;
      }
      count++;
    }
  }

  /**
   * Refresh the status of the lab instance based on the status of the server instance
   * @param labInstanceId
   */
  public async refreshLabStatus(labInstanceId: string): Promise<CnLabInstance> {
    const labInstance = await this.labInstanceService.findByIdAndCheck(labInstanceId);
    if (!labInstance.serverInstanceId) {
      return await this.labInstanceService.markInstanceAsStopped(labInstanceId);
    }

    const cloudProviderService = this.getCloudProviderService(labInstance.getCloudProviderName());
    const serverInstance = await cloudProviderService.getInstance(labInstance.serverInstanceId);
    return await this.updateLabStatusFromServerStatus(labInstance, serverInstance.status);
  }


  /**
   * Update the lab status based on the server instance status
   * @private
   */
  private updateLabStatusFromServerStatus(labInstance: CnLabInstance, serverInstanceStatus: CnCpInstanceStatus): Promise<CnLabInstance> {
    const statusMapping: Record<CnCpInstanceStatus, CnLabInstanceStatus> = {
      'RUNNING': CnLabInstanceStatus.RUNNING,
      'STOPPED': CnLabInstanceStatus.STOPPED,
      'CREATING': CnLabInstanceStatus.STARTING,
      'RESTARTING': CnLabInstanceStatus.STARTING,
      'STOPPING': CnLabInstanceStatus.STOPPING,
    };

    const labStatus: CnLabInstanceStatus = statusMapping[serverInstanceStatus];
    if (!labStatus) {
      throw new BadRequestException(`Unknown server status ${serverInstanceStatus}`);
    }
    return this.labInstanceService.updateCurrentStatusIfChangedWithDbEntity(labStatus, labInstance);
  }


  private getCloudProviderService(cloudProvider: CnCloudProviderName): CnCloudProviderService {
    switch (cloudProvider) {
      case 'OVH':
        return this.ovhCloudProviderService;
      default:
        throw new BadRequestException(`Cloud provider ${cloudProvider} not supported`);
    }
  }

}
