import { Injectable, Logger } from '@nestjs/common';
import { CnCloudProviderOvhService } from './ovh/cn-cloud-provider-ovh.service';
import { CnCloudProviderService } from './cn-cloud-provider.service';
import {
  CnCpCompleteInfo,
  CnCpCreateInstanceRequest,
  CnCpCreateVolumeRequest,
  CnCpInstance,
  CnCpInstanceStatusObject,
  CnCpVolume
} from './cn-cloud-provider.class';
import { CnLab } from '../cn-lab.entity';
import { CnLabsService } from '../cn-labs.service';
import { CnLabServerTaskStatus } from '../status/cn-lab-status.enum';
import { BlBadRequestException } from '@monorepo/back-core-lib';
import { CnExternalLabApiService } from '../../cn-external-lab-api/cn-external-lab-api.service';
import { CnCloudProviderFactory } from './cn-cloud-provider.factory';
import { CnCurrentUserHelper } from '../../cn-core/utils/cn-current-user.helper';

/**
 * Service to manage the lab server via the cloud provider
 */
@Injectable()
export class CnLabServerService {

  private readonly logger = new Logger(CnLabServerService.name);


  constructor(private ovhCloudProviderService: CnCloudProviderOvhService,
              private cloudProviderFactory: CnCloudProviderFactory,
              private labService: CnLabsService,
              private externalLabApiService: CnExternalLabApiService) {
  }

  public async getCompleteInfo(lab: CnLab): Promise<CnCpCompleteInfo> {
    const cloudProviderService = await this.cloudProviderFactory.getCloudProviderServiceFromLab(lab.id);

    const info: CnCpCompleteInfo = {
      instance: null,
      volume: null,
      domainRecord: null
    };

    const promises = [];
    if (lab.serverInstanceId) {
      promises.push(cloudProviderService.getInstance(lab.serverInstanceId)
        .then((instance) => info.instance = instance)
        .catch(err => this.logger.error(err)));
    }

    if (lab.serverVolumeId) {
      promises.push(cloudProviderService.getVolume(lab.serverVolumeId)
        .then((volume) => info.volume = volume)
        .catch(err => this.logger.error(err)));
    }

    promises.push(this.ovhCloudProviderService.getLabDomainRecord(lab.getMainDomain(), lab.getSubDomainName())
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
  public async initInstance(lab: CnLab): Promise<CnLab> {

    const serverCloud = await this.labService.getLabServerCloud(lab.id);
    const cloudProviderName = serverCloud.cloudProvider.name;
    const cloudProviderService = this.cloudProviderFactory.getCloudProviderService(cloudProviderName);

    let serverInstance: CnCpInstance;

    if (!lab.serverInstanceId) {
      // Creating the server instance
      serverInstance = await this.createLab(cloudProviderService, lab);
      lab = await this.labService.updatePartial(lab.id, { serverInstanceId: serverInstance.id });
    } else {
      serverInstance = await cloudProviderService.getInstance(lab.serverInstanceId);
      if (serverInstance == null) {
        throw new BlBadRequestException(`Server instance ${lab.serverInstanceId} not found in cloud provider ${cloudProviderName}`);
      }
      this.logger.log(`Server instance ${lab.serverInstanceId} already exists for lab ${lab.id}. Skipping creation`);
    }

    let volume: CnCpVolume;

    if (!lab.serverVolumeId) {
      // Creating the volume
      volume = await this.createVolume(cloudProviderService, lab);
      lab = await this.labService.updatePartial(lab.id, { serverVolumeId: volume.id });
    } else {
      volume = await cloudProviderService.getVolume(lab.serverVolumeId);
      if (volume == null) {
        throw new BlBadRequestException(`Volume ${lab.serverVolumeId} not found in cloud provider ${cloudProviderName}`);
      }
      this.logger.log(`Volume ${lab.serverVolumeId} already exists for lab ${lab.id}. Skipping creation`);
    }


    // Waiting for the server and the volume to be ready
    let count = 0;
    while ((serverInstance.status.status === 'CREATING' || volume.status === 'CREATING') && count < 10) {

      if (count === 0) {
        await this.labService.updateServerTask(lab.id, 'Waiting for server and volume to be ready',
          CnLabServerTaskStatus.RUNNING);
      }
      // wait 30 seconds
      // eslint-disable-next-line max-len
      this.logger.log(`Waiting for instance ${serverInstance.id} and volume ${volume.id} to be ready for lab ${lab.id} in cloud provider ${cloudProviderName}. Count: ${count}`);
      await new Promise(r => setTimeout(r, 30000));

      // refresh lab if needed
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
      await this.attachVolumeToInstance(cloudProviderService, serverInstance.id, volume.id, lab.id);
    } else {
      // check that the volume is attached to the instance
      if (!await cloudProviderService.volumeIsAttachedToInstance(serverInstance.id, volume.id)) {
        // eslint-disable-next-line max-len
        throw new BlBadRequestException(`For lab ${lab.id}, volume ${volume.id} is not attached to instance ${serverInstance.id}.'`);
      }
      this.logger.log(`Volume ${volume.id} was already attached to lab ${lab.id}. Skipping attachment`);
    }

    // create domain record
    const ipv4 = await cloudProviderService.getIpAddress(serverInstance.id);
    await this.createDomainRecordForLab(lab, ipv4);

    return lab;
  }

  private async createLab(service: CnCloudProviderService, lab: CnLab): Promise<CnCpInstance> {

    const regionName = lab.region.technicalName;

    const labServer = await this.labService.getLabServerCloud(lab.id);

    if (!labServer) {
      throw new BlBadRequestException(`Server cloud not found for lab ${lab.id}`);
    }

    await this.labService.updateServerTask(lab.id,
      `Creating server instance ${labServer.technicalName} in cloud provider ${service.getName()}`,
      CnLabServerTaskStatus.RUNNING
    );
    // eslint-disable-next-line max-len
    this.logger.log(`Creating server instance ${lab.cloudName} ${labServer.technicalName} for lab ${lab.id} in cloud provider ${service.getName()}`);
    const instanceRequest: CnCpCreateInstanceRequest = {
      name: lab.cloudName,
      region: regionName,
      serverName: labServer.technicalName,
      billing: lab.billingMode
    };
    const serverInstance = await service.createInstance(instanceRequest);
    this.logger.log(`Instance ${serverInstance.id} created in for lab ${lab.id} in cloud provider ${service.getName()}`);
    return serverInstance;
  }

  private async createVolume(service: CnCloudProviderService, lab: CnLab): Promise<CnCpVolume> {

    const volumeRequest: CnCpCreateVolumeRequest = {
      name: lab.cloudName,
      description: 'Volume for lab ' + lab.name,
      size: lab.volumeSize,
      type: lab.volumeType,
      region: lab.region.technicalName
    };

    await this.labService.updateServerTask(lab.id,
      `Creating volume in cloud provider ${service.getName()}`,
      CnLabServerTaskStatus.RUNNING
    );
    this.logger.log(`Creating volume for lab ${lab.id} in cloud provider ${service.getName()}`);
    const volume = await service.createVolume(volumeRequest);
    this.logger.log(`Volume ${volume.id} created for lab ${lab.id} in cloud provider ${service.getName()}`);
    return volume;
  }

  private async createDomainRecordForLab(lab: CnLab, ipv4: string): Promise<void> {
    const mainDomain = lab.getMainDomain();
    const subDomainName = lab.getSubDomainName();

    const domainExists = await this.ovhCloudProviderService.labDomainRecordExists(mainDomain, subDomainName);
    // check if the domain record already exists
    if (domainExists) {
      this.logger.log(`Domain record ${subDomainName} for lab ${lab.id} already exists, skipping creation`);
      if (!lab.dnsConfigured) {
        await this.labService.updatePartial(lab.id, { dnsConfigured: true });
      }
      return;
    }

    if (!ipv4) {
      throw new BlBadRequestException(
        'The ip adresse of the server is not available, please retry in few minutes and contact the support if the problem persists');
    }
    await this.labService.updateServerTask(lab.id, 'Creating DNS record for the lab',
      CnLabServerTaskStatus.RUNNING);
    this.logger.log(`Creating domain record for lab ${lab.id} with subdomain ${subDomainName}`);
    try {
      await this.ovhCloudProviderService.createDomainForLab(ipv4, mainDomain, subDomainName);
    } catch (e) {
      throw new Error(`Error while creating domain record for lab. Error: ${e}`);
    }
    this.logger.log(`Domain record created for lab ${lab.id} with subdomain ${subDomainName}`);
    await this.labService.updatePartial(lab.id, { dnsConfigured: true });
  }

  private async attachVolumeToInstance(service: CnCloudProviderService, serverInstanceId: string, volumeId: string,
                                       labId: string): Promise<CnCpVolume> {
    await this.labService.updateServerTask(labId, 'Attaching volume to server instance',
      CnLabServerTaskStatus.RUNNING);
    // eslint-disable-next-line max-len
    this.logger.log(`Attaching volume ${volumeId} to instance ${serverInstanceId} for lab ${labId} in cloud provider ${service.getName()}`);
    const volume = await service.attachVolumeToInstance(serverInstanceId, volumeId);
    // eslint-disable-next-line max-len
    this.logger.log(`Volume ${volume.id} attached to instance ${serverInstanceId} for lab ${labId} in cloud provider ${service.getName()}`);
    return volume;
  }


  public async deleteLabServerAndVolume(lab: CnLab): Promise<void> {
    const cloudProviderService = await this.cloudProviderFactory.getCloudProviderServiceFromLab(lab.id);

    if (lab.serverInstanceId) {
      this.logger.log(`Deleting server instance ${lab.serverInstanceId} for lab ${lab.id}`);
      await cloudProviderService.deleteInstance(lab.serverInstanceId);
      const serverInstanceId = lab.serverInstanceId;
      await this.labService.updatePartial(lab.id, { serverInstanceId: null });
      this.logger.log(`Server instance ${serverInstanceId} deleted for lab ${lab.id}`);
    } else {
      this.logger.log(`No server instance for lab ${lab.id}`);
    }

    if (lab.serverVolumeId) {
      this.logger.log(`Deleting volume ${lab.serverVolumeId} for lab ${lab.id}`);
      await cloudProviderService.deleteVolume(lab.serverVolumeId);
      const volumeId = lab.serverVolumeId;
      await this.labService.updatePartial(lab.id, { serverVolumeId: null });
      this.logger.log(`Volume ${volumeId} deleted for lab ${lab.id}`);
    } else {
      this.logger.log(`No volume for lab ${lab.id}. Skipping deletion`);
    }

    // delete domain record
    const mainDomain = lab.getMainDomain();
    const subDomainName = lab.getSubDomainName();
    const domainExists = await this.ovhCloudProviderService.labDomainRecordExists(mainDomain, subDomainName);
    // check if the domain record already exists
    if (domainExists) {
      this.logger.log(`Deleting domain record ${lab.virtualHost} for lab ${lab.id}`);
      await this.ovhCloudProviderService.deleteDomainRecord(lab.getMainDomain(), lab.getSubDomainName());
      await this.labService.updatePartial(lab.id, { dnsConfigured: false });
      this.logger.log(`Domain record ${lab.virtualHost} deleted for lab ${lab.id}`);
    } else {
      if (lab.dnsConfigured) {
        await this.labService.updatePartial(lab.id, { dnsConfigured: false });
      }
      this.logger.log(`No domain record for lab ${lab.id}. Skipping deletion`);
    }
  }

  public async startLab(lab: CnLab): Promise<CnLab> {
    if (!lab.serverInstanceId) {
      throw new BlBadRequestException(`Lab has no server instance was it correctly initialized?`);
    }

    const cloudProviderService = await this.cloudProviderFactory.getCloudProviderServiceFromLab(lab.id);

    const serverInstance = await cloudProviderService.getInstance(lab.serverInstanceId);

    if (serverInstance.status.status === 'CREATING' || serverInstance.status.status === 'RESTARTING'
      || serverInstance.status.status === 'STOPPING') {
      throw new BlBadRequestException(`Server is currently ${serverInstance.status.status}`);
    }

    // if the server is stopped
    const user = CnCurrentUserHelper.getAndCheckCurrentUser();
    this.logger.log(`Starting server instance ${lab.serverInstanceId} for lab ${lab.id} by ${user.email}`);
    await cloudProviderService.startInstance(lab.serverInstanceId);
    return await this.labService.markInstanceAsServerStarting(lab.id);
  }


  public async stopLab(lab: CnLab): Promise<CnLab> {
    if (!lab.serverInstanceId) {
      throw new BlBadRequestException(`Lab has no server instance was it correctly initialized?`);
    }

    const cloudProviderService = await this.cloudProviderFactory.getCloudProviderServiceFromLab(lab.id);

    const serverInstance = await cloudProviderService.getInstance(lab.serverInstanceId);

    if (serverInstance.status.status !== 'RUNNING') {
      throw new BlBadRequestException(`Server is currently ${serverInstance.status.status}`);
    }

    // if the server is running
    const user = CnCurrentUserHelper.getAndCheckCurrentUser();
    this.logger.log(`Stopping server instance ${lab.serverInstanceId} for lab ${lab.id} by ${user.email}`);
    await cloudProviderService.stopInstance(lab.serverInstanceId);
    return await this.labService.markInstanceAsServerStopping(lab.id);
  }


  /**
   * Check if the lab has any activity (running scenarios, queued scenarios, dev environment running)
   * @param lab
   * @param throwErrorOnActivityGetError if true, throw an error if the activity cannot be retrieved
   */
  public async checkLabActivity(lab: CnLab, throwErrorOnActivityGetError: boolean = false): Promise<void> {
    // check if there are any running containers
    const labActivity = await this.externalLabApiService.getLabGlobalActivity(lab.getGlabSpaceApiInfo())
      .catch(error => {
        if (throwErrorOnActivityGetError) {
          throw error;
        }
        this.logger.error(`Could not get lab activity for lab ${lab.id}. Error: ${error}`);
        return null;
      });

    if (labActivity == null) return;

    if (labActivity.running_scenarios > 0) {
      throw new BlBadRequestException(`Lab has ${labActivity.running_scenarios} running scenarios. Please stop them first`);
    }

    if (labActivity.queued_scenarios > 0) {
      throw new BlBadRequestException(`Lab has ${labActivity.queued_scenarios} queued scenarios. Please remove them form queue first`);
    }

    if (labActivity.dev_env_running) {
      throw new BlBadRequestException(`The dev environment is running. Please stop it first`);
    }
  }

  public async getLabServerStatus(lab: CnLab): Promise<CnCpInstanceStatusObject> {
    const cloudProviderService = await this.cloudProviderFactory.getCloudProviderServiceFromLab(lab.id);
    const serverInstance = await cloudProviderService.getInstance(lab.serverInstanceId);
    return serverInstance.status;
  }
}
