import {Injectable, Logger} from '@nestjs/common';
import {CnCloudProviderOvhService} from './ovh/cn-cloud-provider-ovh.service';
import {CnCloudProviderService} from './cn-cloud-provider.service';
import {
  CnCpCompleteInfo,
  CnCpCreateInstanceRequest,
  CnCpCreateVolumeRequest,
  CnCpInstance,
  CnCpInstanceStatusObject,
  CnCpVolume
} from './cn-cloud-provider.class';
import {CnLabInstance} from '../cn-lab-instance.entity';
import {CnLabInstancesService} from '../cn-lab-instances.service';
import {CnLabInstanceServerTaskStatus} from '../status/cn-lab-instance-status.enum';
import {BlBadRequestException} from '@monorepo/back-core-lib';
import {CnExternalLabApiService} from '../../cn-external-lab-api/cn-external-lab-api.service';
import {CnCloudProviderFactory} from './cn-cloud-provider.factory';
import {CnCurrentUserHelper} from '../../cn-core/utils/cn-current-user.helper';

/**
 * Service to manage the lab server via the cloud provider
 */
@Injectable()
export class CnLabServerService {

  private readonly logger = new Logger(CnLabServerService.name);


  constructor(private ovhCloudProviderService: CnCloudProviderOvhService,
              private cloudProviderFactory: CnCloudProviderFactory,
              private labInstanceService: CnLabInstancesService,
              private externalLabApiService: CnExternalLabApiService) {
  }

  public async getCompleteInfo(labInstance: CnLabInstance): Promise<CnCpCompleteInfo> {
    const cloudProviderService = await this.cloudProviderFactory.getCloudProviderServiceFromLab(labInstance.id);

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
   *
   * When calling this method it must be wrapped around a try catch to mark serverTask as error if needed
   */
  public async initInstance(labInstance: CnLabInstance): Promise<CnLabInstance> {

    const serverCloud = await this.labInstanceService.getLabServerCloud(labInstance.id);
    const cloudProviderName = serverCloud.cloudProvider.name;
    const cloudProviderService = this.cloudProviderFactory.getCloudProviderService(cloudProviderName);

    let serverInstance: CnCpInstance;

    if (!labInstance.serverInstanceId) {
      // Creating the server instance
      serverInstance = await this.createLabInstance(cloudProviderService, labInstance);
      labInstance = await this.labInstanceService.updatePartial(labInstance.id, {serverInstanceId: serverInstance.id});
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
      labInstance = await this.labInstanceService.updatePartial(labInstance.id, {serverVolumeId: volume.id});
    } else {
      volume = await cloudProviderService.getVolume(labInstance.serverVolumeId);
      if (volume == null) {
        throw new BlBadRequestException(`Volume ${labInstance.serverVolumeId} not found in cloud provider ${cloudProviderName}`);
      }
      this.logger.log(`Volume ${labInstance.serverVolumeId} already exists for lab ${labInstance.id}. Skipping creation`);
    }


    // Waiting for the server and the volume to be ready
    let count = 0;
    while ((serverInstance.status.status === 'CREATING' || volume.status === 'CREATING') && count < 10) {

      if (count === 0) {
        await this.labInstanceService.updateServerTask(labInstance.id, 'Waiting for server and volume to be ready',
          CnLabInstanceServerTaskStatus.RUNNING);
      }
      // wait 30 seconds
      // eslint-disable-next-line max-len
      this.logger.log(`Waiting for instance ${serverInstance.id} and volume ${volume.id} to be ready for lab ${labInstance.id} in cloud provider ${cloudProviderName}. Count: ${count}`);
      await new Promise(r => setTimeout(r, 30000));

      // refresh lab instance if needed
      if (serverInstance.status.status !== 'RUNNING') {
        serverInstance = await cloudProviderService.getInstance(serverInstance.id);
      }

      // refresh volume if needed
      if (volume.status !== 'AVAILABLE') {
        volume = await cloudProviderService.getVolume(volume.id);
      }

      count++;
    }

    if (serverInstance.status.status === 'CREATING') {
      throw new BlBadRequestException(
        'Server instance not ready, please refresh the status if few minutes and then contact the support if the problem persists');
    }
    if (volume.status === 'CREATING') {
      throw new BlBadRequestException(
        'Volume not ready, please refresh the status if few minutes and then contact the support if the problem persists');
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

    const labServer = await this.labInstanceService.getLabServerCloud(labInstance.id);

    if (!labServer) {
      throw new BlBadRequestException(`Server cloud not found for lab ${labInstance.id}`);
    }

    await this.labInstanceService.updateServerTask(labInstance.id,
      `Creating server instance ${labServer.technicalName} in cloud provider ${service.getName()}`,
      CnLabInstanceServerTaskStatus.RUNNING
    );
    // eslint-disable-next-line max-len
    this.logger.log(`Creating server instance ${labInstance.cloudName} ${labServer.technicalName} for lab ${labInstance.id} in cloud provider ${service.getName()}`);
    const instanceRequest: CnCpCreateInstanceRequest = {
      name: labInstance.cloudName,
      region: regionName,
      serverName: labServer.technicalName,
      billing: labInstance.billingMode,
    };
    const serverInstance = await service.createInstance(instanceRequest);
    this.logger.log(`Instance ${serverInstance.id} created in for lab ${labInstance.id} in cloud provider ${service.getName()}`);
    return serverInstance;
  }

  private async createVolume(service: CnCloudProviderService, labInstance: CnLabInstance): Promise<CnCpVolume> {

    const volumeRequest: CnCpCreateVolumeRequest = {
      name: labInstance.cloudName,
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
      if (!labInstance.dnsConfigured) {
        await this.labInstanceService.updatePartial(labInstance.id, {dnsConfigured: true});
      }
      return;
    }

    if (!ipv4) {
      throw new BlBadRequestException(
        'The ip adresse of the server is not available, please retry in few minutes and contact the support if the problem persists');
    }
    await this.labInstanceService.updateServerTask(labInstance.id, 'Creating DNS record for the lab',
      CnLabInstanceServerTaskStatus.RUNNING);
    this.logger.log(`Creating domain record for lab ${labInstance.id} with subdomain ${subDomainName}`);
    try {
      await this.ovhCloudProviderService.createDomainForLab(ipv4, mainDomain, subDomainName);
    } catch (e) {
      throw new Error(`Error while creating domain record for lab. Error: ${e}`);
    }
    this.logger.log(`Domain record created for lab ${labInstance.id} with subdomain ${subDomainName}`);
    await this.labInstanceService.updatePartial(labInstance.id, {dnsConfigured: true});
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
    const cloudProviderService = await this.cloudProviderFactory.getCloudProviderServiceFromLab(labInstance.id);

    if (labInstance.serverInstanceId) {
      this.logger.log(`Deleting server instance ${labInstance.serverInstanceId} for lab ${labInstance.id}`);
      await cloudProviderService.deleteInstance(labInstance.serverInstanceId);
      const serverInstanceId = labInstance.serverInstanceId;
      await this.labInstanceService.updatePartial(labInstance.id, {serverInstanceId: null});
      this.logger.log(`Server instance ${serverInstanceId} deleted for lab ${labInstance.id}`);
    } else {
      this.logger.log(`No server instance for lab ${labInstance.id}`);
    }

    if (labInstance.serverVolumeId) {
      this.logger.log(`Deleting volume ${labInstance.serverVolumeId} for lab ${labInstance.id}`);
      await cloudProviderService.deleteVolume(labInstance.serverVolumeId);
      const volumeId = labInstance.serverVolumeId;
      await this.labInstanceService.updatePartial(labInstance.id, {serverVolumeId: null});
      this.logger.log(`Volume ${volumeId} deleted for lab ${labInstance.id}`);
    } else {
      this.logger.log(`No volume for lab ${labInstance.id}. Skipping deletion`);
    }

    // delete domain record
    const mainDomain = labInstance.getMainDomain();
    const subDomainName = labInstance.getSubDomainName();
    const domainExists = await this.ovhCloudProviderService.labDomainRecordExists(mainDomain, subDomainName);
    // check if the domain record already exists
    if (domainExists) {
      this.logger.log(`Deleting domain record ${labInstance.virtualHost} for lab ${labInstance.id}`);
      await this.ovhCloudProviderService.deleteDomainRecord(labInstance.getMainDomain(), labInstance.getSubDomainName());
      await this.labInstanceService.updatePartial(labInstance.id, {dnsConfigured: false});
      this.logger.log(`Domain record ${labInstance.virtualHost} deleted for lab ${labInstance.id}`);
    } else {
      if (labInstance.dnsConfigured) {
        await this.labInstanceService.updatePartial(labInstance.id, {dnsConfigured: false});
      }
      this.logger.log(`No domain record for lab ${labInstance.id}. Skipping deletion`);
    }
  }

  public async startLab(labInstance: CnLabInstance): Promise<CnLabInstance> {
    if (!labInstance.serverInstanceId) {
      throw new BlBadRequestException(`Lab has no server instance was it correctly initialized?`);
    }

    const cloudProviderService = await this.cloudProviderFactory.getCloudProviderServiceFromLab(labInstance.id);

    const serverInstance = await cloudProviderService.getInstance(labInstance.serverInstanceId);

    if (serverInstance.status.status === 'CREATING' || serverInstance.status.status === 'RESTARTING'
      || serverInstance.status.status === 'STOPPING') {
      throw new BlBadRequestException(`Server is currently ${serverInstance.status.status}`);
    }

    // if the server is stopped
    const user = CnCurrentUserHelper.getAndCheckCurrentUser();
    this.logger.log(`Starting server instance ${labInstance.serverInstanceId} for lab ${labInstance.id} by ${user.email}`);
    await cloudProviderService.startInstance(labInstance.serverInstanceId);
    return await this.labInstanceService.markInstanceAsServerStarting(labInstance.id);
  }


  public async stopLab(labInstance: CnLabInstance): Promise<CnLabInstance> {
    if (!labInstance.serverInstanceId) {
      throw new BlBadRequestException(`Lab has no server instance was it correctly initialized?`);
    }

    const cloudProviderService = await this.cloudProviderFactory.getCloudProviderServiceFromLab(labInstance.id);

    const serverInstance = await cloudProviderService.getInstance(labInstance.serverInstanceId);

    if (serverInstance.status.status !== 'RUNNING') {
      throw new BlBadRequestException(`Server is currently ${serverInstance.status.status}`);
    }

    // if the server is running
    const user = CnCurrentUserHelper.getAndCheckCurrentUser();
    this.logger.log(`Stopping server instance ${labInstance.serverInstanceId} for lab ${labInstance.id} by ${user.email}`);
    await cloudProviderService.stopInstance(labInstance.serverInstanceId);
    return await this.labInstanceService.markInstanceAsServerStopping(labInstance.id);
  }


  /**
   * Check if the lab has any activity (running experiments, queued experiments, dev environment running)
   * @param labInstance
   * @param throwErrorOnActivityGetError if true, throw an error if the activity cannot be retrieved
   */
  public async checkLabActivity(labInstance: CnLabInstance, throwErrorOnActivityGetError: boolean = false): Promise<void> {
    // check if there are any running containers
    const labActivity = await this.externalLabApiService.getLabGlobalActivity(labInstance.getGlabSpaceApiInfo())
      .catch(error => {
        if (throwErrorOnActivityGetError) {
          throw error;
        }
        this.logger.error(`Could not get lab activity for lab ${labInstance.id}. Error: ${error}`);
        return null;
      });

    if (labActivity == null) return;

    if (labActivity.running_experiments > 0) {
      throw new BlBadRequestException(`Lab has ${labActivity.running_experiments} running experiments. Please stop them first`);
    }

    if (labActivity.queued_experiments > 0) {
      throw new BlBadRequestException(`Lab has ${labActivity.queued_experiments} queued experiments. Please remove them form queue first`);
    }

    if (labActivity.dev_env_running) {
      throw new BlBadRequestException(`The dev environment is running. Please stop it first`);
    }
  }

  public async getLabServerStatus(labInstance: CnLabInstance): Promise<CnCpInstanceStatusObject> {
    const cloudProviderService = await this.cloudProviderFactory.getCloudProviderServiceFromLab(labInstance.id);
    const serverInstance = await cloudProviderService.getInstance(labInstance.serverInstanceId);
    return serverInstance.status;
  }
}
