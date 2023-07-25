import {Injectable, Logger} from '@nestjs/common';
import {CnCloudProviderOvhService} from './ovh/cn-cloud-provider-ovh.service';
import {CnCloudProviderService} from './cn-cloud-provider.service';
import {
  CnCpBackupFrequency,
  CnCpCompleteInfo,
  CnCpCreateInstanceRequest,
  CnCpCreateVolumeRequest,
  CnCpInstance,
  CnCpInstanceStatus,
  CnCpVolume
} from './cn-cloud-provider.class';
import {CnLabInstance} from '../cn-lab-instance.entity';
import {CnLabInstancesService} from '../cn-lab-instances.service';
import {
  CnLabInstanceServerTaskStatus,
  CnLabInstanceStatus,
  cnLabInstanceTemporaryStatuses
} from '../status/cn-lab-instance-status.enum';
import {BlBadRequestException} from '@monorepo/back-core-lib';
import {CnExternalLabApiService} from '../../cn-external-lab-api/cn-external-lab-api.service';
import {CnCloudProviderFactory} from './cn-cloud-provider.factory';
import {CnCurrentUserHelper} from '../../cn-core/utils/cn-current-user.helper';

/**
 * Service to manage the lab server via the cloud provider
 */
@Injectable()
export class CnLabServerService {

  private static readonly BACKUP_ROTATION = 7;
  private static readonly BACKUP_FREQUENCY: CnCpBackupFrequency = 'DAILY';

  private readonly logger = new Logger(CnLabServerService.name);


  constructor(private ovhCloudProviderService: CnCloudProviderOvhService,
              private cloudProviderFactory: CnCloudProviderFactory,
              private labInstanceService: CnLabInstancesService,
              private externalLabApiService: CnExternalLabApiService) {
  }

  public async getCompleteInfo(labInstance: CnLabInstance): Promise<CnCpCompleteInfo> {
    const cloudProviderService = this.cloudProviderFactory.getCloudProviderService(labInstance.getCloudProviderName());

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

    promises.push(this.ovhCloudProviderService.getLabDomainRecord(labInstance.getMainDomain(), labInstance.getSubDomainName())
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
  public async initInstance(labInstance: CnLabInstance): Promise<CnLabInstance> {

    const cloudProviderName = labInstance.getCloudProviderName();
    const cloudProviderService = this.cloudProviderFactory.getCloudProviderService(cloudProviderName);

    let serverInstance: CnCpInstance;

    if (!labInstance.serverInstanceId) {
      // Creating the server instance
      serverInstance = await this.createLabInstance(cloudProviderService, labInstance);
      labInstance.serverInstanceId = serverInstance.id;
      labInstance = await this.labInstanceService.update(labInstance);
    } else {
      serverInstance = await cloudProviderService.getInstance(labInstance.serverInstanceId);
      if (serverInstance == null) {
        throw new BlBadRequestException(`Server instance ${labInstance.serverInstanceId} not found in cloud provider ${cloudProviderName}`);
      }
      this.logger.log(`Server instance ${labInstance.serverInstanceId} already exists for lab ${labInstance.id}. Skipping creation`);
    }

    let volume: CnCpVolume;

    if (!labInstance.serverVolumeId) {
      // Creating the volume
      volume = await this.createVolume(cloudProviderService, labInstance);
      labInstance.serverVolumeId = volume.id;
      labInstance = await this.labInstanceService.update(labInstance);
    } else {
      volume = await cloudProviderService.getVolume(labInstance.serverVolumeId);
      if (volume == null) {
        throw new BlBadRequestException(`Volume ${labInstance.serverVolumeId} not found in cloud provider ${cloudProviderName}`);
      }
      this.logger.log(`Volume ${labInstance.serverVolumeId} already exists for lab ${labInstance.id}. Skipping creation`);
    }


    // Waiting for the server and the volume to be ready
    let count = 0;
    while ((serverInstance.status === 'CREATING' || volume.status === 'CREATING') && count < 10) {

      if (count === 0) {
        await this.labInstanceService.updateServerTask(labInstance.id, 'Waiting for server and volume to be ready',
          CnLabInstanceServerTaskStatus.RUNNING);
      }
      // wait 30 seconds
      // eslint-disable-next-line max-len
      this.logger.log(`Waiting for instance ${serverInstance.id} and volume ${volume.id} to be ready for lab ${labInstance.id} in cloud provider ${cloudProviderName}. Count: ${count}`);
      await new Promise(r => setTimeout(r, 30000));

      const cloudProviderService = this.cloudProviderFactory.getCloudProviderService(cloudProviderName);
      // refresh lab instance if needed
      if (serverInstance.status !== 'RUNNING') {
        serverInstance = await cloudProviderService.getInstance(serverInstance.id);
      }

      // refresh volume if needed
      if (volume.status !== 'AVAILABLE') {
        volume = await cloudProviderService.getVolume(volume.id);
      }

      count++;
    }

    if (serverInstance.status === 'CREATING') {
      await this.labInstanceService.updateServerTask(labInstance.id,
        'Server instance not ready, please refresh the status if few minutes and then contact the support if the problem persists',
        CnLabInstanceServerTaskStatus.ERROR);
      throw new BlBadRequestException('Instance not ready');
    }
    if (volume.status === 'CREATING') {
      await this.labInstanceService.updateServerTask(labInstance.id,
        'Volume not ready, please refresh the status if few minutes and then contact the support if the problem persists',
        CnLabInstanceServerTaskStatus.ERROR);
      throw new BlBadRequestException('Volume not ready');
    }

    // Attaching the volume to the server
    if (volume.status === 'AVAILABLE') {
      await this.attachVolumeToInstance(cloudProviderService, serverInstance.id, volume.id, labInstance.id);
    } else {
      // check that the volume is attached to the instance
      if (!await cloudProviderService.volumeIsAttachedToInstance(serverInstance.id, volume.id)) {
        // eslint-disable-next-line max-len
        throw new BlBadRequestException(`For lab ${labInstance.id}, volume ${volume.id} is not attached to instance ${serverInstance.id}.'`);
      }
      this.logger.log(`Volume ${volume.id} was already attached to lab ${labInstance.id}. Skipping attachment`);
    }

    // create domain record
    const ipv4 = await cloudProviderService.getIpAddress(serverInstance.id);
    await this.createDomainRecordForLab(labInstance, ipv4);

    return labInstance;
  }

  private async createLabInstance(service: CnCloudProviderService, labInstance: CnLabInstance): Promise<CnCpInstance> {

    const regionName = labInstance.region.technicalName;

    await this.labInstanceService.updateServerTask(labInstance.id,
      `Creating server instance ${labInstance.serverInfo.name} in cloud provider ${service.getName()}`,
      CnLabInstanceServerTaskStatus.RUNNING
    );
    // eslint-disable-next-line max-len
    this.logger.log(`Creating server instance ${labInstance.name} ${labInstance.serverInfo.name} for lab ${labInstance.id} in cloud provider ${service.getName()}`);
    const instanceRequest: CnCpCreateInstanceRequest = {
      name: labInstance.name,
      region: regionName,
      serverName: labInstance.serverInfo.name,
      billing: labInstance.billingMode,
      backupFrequency: CnLabServerService.BACKUP_FREQUENCY,
      backupRotation: CnLabServerService.BACKUP_ROTATION
    };
    const serverInstance = await service.createInstance(instanceRequest);
    this.logger.log(`Instance ${serverInstance.id} created in for lab ${labInstance.id} in cloud provider ${service.getName()}`);
    return serverInstance;
  }

  private async createVolume(service: CnCloudProviderService, labInstance: CnLabInstance): Promise<CnCpVolume> {

    const volumeRequest: CnCpCreateVolumeRequest = {
      name: labInstance.name,
      description: 'Volume for lab ' + labInstance.name,
      size: labInstance.volumeSize,
      type: labInstance.volumeType,
      region: labInstance.region.technicalName
    };

    await this.labInstanceService.updateServerTask(labInstance.id,
      `Creating volume in cloud provider ${service.getName()}`,
      CnLabInstanceServerTaskStatus.RUNNING
    );
    this.logger.log(`Creating volume for lab ${labInstance.id} in cloud provider ${service.getName()}`);
    const volume = await service.createVolume(volumeRequest);
    this.logger.log(`Volume ${volume.id} created for lab ${labInstance.id} in cloud provider ${service.getName()}`);
    return volume;
  }

  private async createDomainRecordForLab(labInstance: CnLabInstance, ipv4: string): Promise<void> {
    const mainDomain = labInstance.getMainDomain();
    const subDomainName = labInstance.getSubDomainName();

    const domainExists = await this.ovhCloudProviderService.labDomainRecordExists(mainDomain, subDomainName);
    // check if the domain record already exists
    if (domainExists) {
      this.logger.log(`Domain record ${subDomainName} for lab ${labInstance.id} already exists, skipping creation`);
      return;
    }

    if (!ipv4) {
      await this.labInstanceService.updateServerTask(labInstance.id,
        'The ip adresse of the server is not available, please retry in few minutes and contact the support if the problem persists',
        CnLabInstanceServerTaskStatus.ERROR);
      throw new BlBadRequestException(`No IP address for lab ${labInstance.id} with server id ${labInstance.serverInstanceId}`);
    }

    await this.labInstanceService.updateServerTask(labInstance.id, 'Creating DNS record for the lab',
      CnLabInstanceServerTaskStatus.RUNNING);
    this.logger.log(`Creating domain record for lab ${labInstance.id} with subdomain ${subDomainName}`);
    await this.ovhCloudProviderService.createDomainForLab(ipv4, mainDomain, subDomainName);
    this.logger.log(`Domain record created for lab ${labInstance.id} with subdomain ${subDomainName}`);
  }

  private async attachVolumeToInstance(service: CnCloudProviderService, serverInstanceId: string, volumeId: string,
                                       labInstanceId: string): Promise<CnCpVolume> {
    await this.labInstanceService.updateServerTask(labInstanceId, 'Attaching volume to server instance',
      CnLabInstanceServerTaskStatus.RUNNING);
    // eslint-disable-next-line max-len
    this.logger.log(`Attaching volume ${volumeId} to instance ${serverInstanceId} for lab ${labInstanceId} in cloud provider ${service.getName()}`);
    const volume = await service.attachVolumeToInstance(serverInstanceId, volumeId);
    // eslint-disable-next-line max-len
    this.logger.log(`Volume ${volume.id} attached to instance ${serverInstanceId} for lab ${labInstanceId} in cloud provider ${service.getName()}`);
    return volume;
  }


  public async deleteLabInstanceServerAndVolume(labInstance: CnLabInstance): Promise<void> {
    const cloudProviderService = this.cloudProviderFactory.getCloudProviderService(labInstance.getCloudProviderName());

    if (labInstance.serverInstanceId) {
      this.logger.log(`Deleting server instance ${labInstance.serverInstanceId} for lab ${labInstance.id}`);
      await cloudProviderService.deleteInstance(labInstance.serverInstanceId);
      const serverInstanceId = labInstance.serverInstanceId;
      labInstance.serverInstanceId = null;
      await this.labInstanceService.update(labInstance);
      this.logger.log(`Server instance ${serverInstanceId} deleted for lab ${labInstance.id}`);
    } else {
      this.logger.log(`No server instance for lab ${labInstance.id}`);
    }

    if (labInstance.serverVolumeId) {
      this.logger.log(`Deleting volume ${labInstance.serverVolumeId} for lab ${labInstance.id}`);
      await cloudProviderService.deleteVolume(labInstance.serverVolumeId);
      const volumeId = labInstance.serverVolumeId;
      labInstance.serverVolumeId = null;
      await this.labInstanceService.update(labInstance);
      this.logger.log(`Volume ${volumeId} deleted for lab ${labInstance.id}`);
    } else {
      this.logger.log(`No volume for lab ${labInstance.id}. Skipping deletion`);
    }

    this.logger.log(`Deleting domain record ${labInstance.virtualHost} for lab ${labInstance.id}`);
    await this.ovhCloudProviderService.deleteDomainRecord(labInstance.getMainDomain(), labInstance.getSubDomainName());

    await this.refreshLabStatus(labInstance.id);
  }

  public async startLab(labInstance: CnLabInstance): Promise<CnLabInstance> {
    if (!labInstance.serverInstanceId) {
      throw new BlBadRequestException(`Lab has no server instance was it correctly initialized?`);
    }

    const cloudProviderService = this.cloudProviderFactory.getCloudProviderService(labInstance.getCloudProviderName());

    const serverInstance = await cloudProviderService.getInstance(labInstance.serverInstanceId);

    // if the server is running
    if (serverInstance.status === 'RUNNING') {
      //set lab instance to running if it is not already
      if (labInstance.currentStatus.status !== CnLabInstanceStatus.SERVER_RUNNING) {
        this.logger.log(`Refreshing lab ${labInstance.id} status to server running`);
        return await this.labInstanceService.markInstanceAsServerRunning(labInstance.id);
      } else {
        throw new BlBadRequestException(`Lab is already running`);
      }
    }

    if (serverInstance.status === 'CREATING' || serverInstance.status === 'RESTARTING' || serverInstance.status === 'STOPPING') {
      throw new BlBadRequestException(`Lab is currently ${serverInstance.status}`);
    }

    // if the server is stopped
    const user = CnCurrentUserHelper.getAndCheckCurrentUser();
    this.logger.log(`Starting server instance ${labInstance.serverInstanceId} for lab ${labInstance.id} by ${user.email}`);
    await this.labInstanceService.updateServerTask(labInstance.id, 'Starting server instance', CnLabInstanceServerTaskStatus.RUNNING);
    await cloudProviderService.startInstance(labInstance.serverInstanceId);
    labInstance = await this.labInstanceService.markInstanceAsServerStarting(labInstance.id);

    this.checkServerNotBusyAsync(labInstance);

    labInstance = await this.labInstanceService.findByIdAndCheck(labInstance.id);
    if (labInstance.currentStatus.status === CnLabInstanceStatus.SERVER_RUNNING) {
      await this.labInstanceService.updateServerTask(labInstance.id, 'Lab server started', CnLabInstanceServerTaskStatus.SUCCESS);
    } else {
      await this.labInstanceService.updateServerTask(labInstance.id,
        'Lab server not started, please refresh status later', CnLabInstanceServerTaskStatus.ERROR);
    }
    return labInstance;
  }

  public async stopLab(labInstance: CnLabInstance): Promise<CnLabInstance> {
    if (!labInstance.serverInstanceId) {
      throw new BlBadRequestException(`Lab has no server instance was it correctly initialized?`);
    }

    const cloudProviderService = this.cloudProviderFactory.getCloudProviderService(labInstance.getCloudProviderName());

    const serverInstance = await cloudProviderService.getInstance(labInstance.serverInstanceId);

    // if the server is stopped
    if (serverInstance.status === 'STOPPED') {
      //set lab instance to stopped if it is not already
      if (labInstance.currentStatus.status !== CnLabInstanceStatus.SERVER_STOPPED) {
        this.logger.log(`Refreshing lab ${labInstance.id} status to stopped`);
        return await this.labInstanceService.markInstanceAsServerStopped(labInstance.id);
      } else {
        throw new BlBadRequestException(`Lab is already stopped`);
      }
    }

    if (serverInstance.status !== 'RUNNING') {
      throw new BlBadRequestException(`Lab is currently ${serverInstance.status}`);
    }

    // if the server is running
    const user = CnCurrentUserHelper.getAndCheckCurrentUser();
    this.logger.log(`Stopping server instance ${labInstance.serverInstanceId} for lab ${labInstance.id} by ${user.email}`);
    await this.labInstanceService.updateServerTask(labInstance.id, 'Stopping server instance', CnLabInstanceServerTaskStatus.RUNNING);
    await cloudProviderService.stopInstance(labInstance.serverInstanceId);
    labInstance = await this.labInstanceService.markInstanceAsServerStopping(labInstance.id);

    this.checkServerNotBusyAsync(labInstance);

    labInstance = await this.labInstanceService.findByIdAndCheck(labInstance.id);
    if (labInstance.currentStatus.status === CnLabInstanceStatus.SERVER_STOPPED) {
      await this.labInstanceService.updateServerTask(labInstance.id, 'Lab server stopped', CnLabInstanceServerTaskStatus.SUCCESS);
    } else {
      await this.labInstanceService.updateServerTask(labInstance.id,
        'Lab server not stopped, please refresh status later', CnLabInstanceServerTaskStatus.ERROR);

    }
    return labInstance;
  }

  public async checkLabActivity(labInstance: CnLabInstance): Promise<void> {
    // check if there are any running containers
    const labActivity = await this.externalLabApiService.getLabGlobalActivity(labInstance.getGlabApiInfo())
      .catch(error => {
        this.logger.error(`Could not get lab activity for lab ${labInstance.id}. Error: ${error}`);
        return null;
      });

    if(labActivity == null) return ;

    if (labActivity.running_experiments > 0) {
      throw new BlBadRequestException(`Lab has ${labActivity.running_experiments} running experiments. Please stop them first`);
    }

    if (labActivity.queued_experiments > 0) {
      throw new BlBadRequestException(`Lab has ${labActivity.queued_experiments} queued experiments. Please remove them form queue first`);
    }

    if(labActivity.dev_env_running){
      throw new BlBadRequestException(`The dev environment is running. Please stop it first`);
    }
  }


  private checkServerNotBusyAsync(labInstance: CnLabInstance): void {
    this.checkForServerToBeNotBusy(labInstance.id).catch(
      error => this.logger.error(`Lab ${labInstance.id} is busy. Cannot update lab. Error: ${error}`)
    );
  }

  private async checkForServerToBeNotBusy(labInstanceId: string): Promise<void> {

    // Waiting for the server and the volume to be ready
    let count = 0;
    while (count <= 40) {
      // wait for 60 seconds because start and stop can take a while
      await new Promise(r => setTimeout(r, 30000));

      this.logger.log(`Checking if server of lab ${labInstanceId} is ready`);
      const labInstance = await this.refreshLabStatus(labInstanceId);


      if (cnLabInstanceTemporaryStatuses.includes(labInstance.currentStatus.status)) {
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

    // if the lab is running, don't check server status, mark it as running
    const healthCheck = await this.externalLabApiService.healthCheck(labInstance.getGlabApiInfo());
    if (healthCheck) {
      return await this.labInstanceService.markInstanceAsLabRunning(labInstanceId);
    }

    if (!labInstance.serverInstanceId && !labInstance.serverVolumeId) {
      return await this.labInstanceService.markInstanceAsServerNotConfigured(labInstanceId);
    }

    // if the server instance id is not set, mark the lab as stopped
    if (!labInstance.serverInstanceId) {
      return await this.labInstanceService.markInstanceAsServerStopped(labInstanceId);
    }

    // check server status
    const cloudProviderService = this.cloudProviderFactory.getCloudProviderService(labInstance.getCloudProviderName());
    const serverInstance = await cloudProviderService.getInstance(labInstance.serverInstanceId);
    return await this.updateLabStatusFromServerStatus(labInstance, serverInstance.status);
  }


  /**
   * Update the lab status based on the server instance status
   * @private
   */
  private updateLabStatusFromServerStatus(labInstance: CnLabInstance, serverInstanceStatus: CnCpInstanceStatus): Promise<CnLabInstance> {
    const statusMapping: Record<CnCpInstanceStatus, CnLabInstanceStatus> = {
      'RUNNING': CnLabInstanceStatus.SERVER_RUNNING,
      'STOPPED': CnLabInstanceStatus.SERVER_STOPPED,
      'CREATING': CnLabInstanceStatus.SERVER_STARTING,
      'RESTARTING': CnLabInstanceStatus.SERVER_STARTING,
      'STOPPING': CnLabInstanceStatus.SERVER_STOPPING,
    };

    const labStatus: CnLabInstanceStatus = statusMapping[serverInstanceStatus];
    if (!labStatus) {
      throw new BlBadRequestException(`Unknown server status ${serverInstanceStatus}`);
    }
    return this.labInstanceService.updateCurrentStatusIfChangedWithDbEntity(labStatus, labInstance);
  }

}
