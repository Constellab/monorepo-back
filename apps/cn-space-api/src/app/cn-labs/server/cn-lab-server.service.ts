import { BlBadRequestException } from '@monorepo/back-core-lib';
import { Injectable, Logger } from '@nestjs/common';

import { CnCurrentUserHelper } from '../../cn-core/utils/cn-current-user.helper';
import { CnExternalLabApiService } from '../../cn-external-lab-api/cn-external-lab-api.service';
import { CnLabManagerCreateDnsChallenge } from '../../cn-external-lab-api/model/cn-lab-manager.class';
import { CnLab } from '../cn-lab.entity';
import { CnLabsService } from '../cn-labs.service';
import { CnLabServerTaskStatus } from '../status/cn-lab-status.enum';
import { CnLabVolume } from '../volume/cn-lab-volume-entity';
import {
  CnCpCompleteInfo,
  CnCpCreateInstanceRequest,
  CnCpCreateVolumeRequest,
  CnCpInstance,
  CnCpInstanceStatusObject,
  CnCpInstanceWithVolume,
  CnCpStaticIpAddress,
  CnCpVolume,
} from './cn-cloud-provider.class';
import { CnCloudProviderFactory } from './cn-cloud-provider.factory';
import { CnCloudProviderService } from './cn-cloud-provider.service';
import { CnCloudProviderOvhService } from './ovh/cn-cloud-provider-ovh.service';

/**
 * Service to manage the lab server via the cloud provider
 */
@Injectable()
export class CnLabServerService {
  private readonly logger = new Logger(CnLabServerService.name);

  constructor(
    private ovhCloudProviderService: CnCloudProviderOvhService,
    private cloudProviderFactory: CnCloudProviderFactory,
    private labService: CnLabsService,
    private externalLabApiService: CnExternalLabApiService
  ) {}

  /**
   * Return the technical name of the lab region.
   * The region is required for all cloud provider operations, so it throws if missing.
   */
  private getLabRegionName(lab: CnLab): string {
    if (lab.region == null) {
      throw new BlBadRequestException(`Lab ${lab.id} has no region`);
    }
    return lab.region.technicalName;
  }

  public async getCompleteInfo(lab: CnLab): Promise<CnCpCompleteInfo> {
    const cloudProviderService = await this.cloudProviderFactory.getCloudProviderServiceFromLab(lab.id);

    const info: CnCpCompleteInfo = {
      instance: null,
      volume: null,
      ipAddress: null,
      domainRecord: null,
    };

    const promises = [];
    if (lab.serverInstanceId) {
      promises.push(
        cloudProviderService
          .getInstance(lab.serverInstanceId, this.getLabRegionName(lab))
          .then((instance) => (info.instance = instance))
          .catch((err) => this.logger.error(err))
      );
    }

    if (lab.serverVolumeId) {
      promises.push(
        cloudProviderService
          .getVolume(lab.serverVolumeId, this.getLabRegionName(lab))
          .then((volume) => (info.volume = volume))
          .catch((err) => this.logger.error(err))
      );
    }

    if (lab.serverIpAddressId) {
      promises.push(
        cloudProviderService
          .getIpAddressFromId(lab.serverIpAddressId, this.getLabRegionName(lab))
          .then((ipAddress) => (info.ipAddress = ipAddress))
          .catch((err) => this.logger.error(err))
      );
    }

    promises.push(
      this.ovhCloudProviderService
        .getLabDomainHostRecord(lab.getMainDomain(), lab.getSubDomainName())
        .then((domainRecord) => (info.domainRecord = domainRecord))
        .catch((err) => this.logger.error(err))
    );

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
  public async initInstance(lab: CnLab, labVolume: CnLabVolume): Promise<CnLab> {
    const serverCloud = await this.labService.getLabServerCloud(lab.id);
    const cloudProviderName = serverCloud.cloudProvider.name;
    const cloudProviderService = this.cloudProviderFactory.getCloudProviderService(cloudProviderName);

    // Create or get the static IP address
    const staticIpAddress = await this.initStaticIpAddress(cloudProviderService, lab, cloudProviderName);
    lab = staticIpAddress.lab;

    // Create or get the server instance
    lab = await this.initServerInstance(cloudProviderService, lab, staticIpAddress.ipAddress, labVolume);

    // Create or get the volume (skip if already created with the instance)
    lab = await this.initServerVolume(cloudProviderService, lab, labVolume, cloudProviderName);

    const serverWithInstance = await this.waitForInstanceAndVolume(cloudProviderService, lab);

    // Attaching the volume to the server
    await this.initVolumeAttachment(cloudProviderService, lab, serverWithInstance);

    // create domain record
    if (!lab.serverInstanceId) {
      throw new BlBadRequestException(`Lab ${lab.id} has no server instance`);
    }
    const ipv4 = await cloudProviderService.getIpAddressFromInstanceId(
      lab.serverInstanceId,
      this.getLabRegionName(lab)
    );
    await this.createDomainRecordForLab(lab, ipv4);

    return lab;
  }

  /**
   * Create the static IP address when the cloud provider needs one before the instance,
   * or check the one already referenced by the lab. Returns the lab, updated if the
   * address was just created.
   */
  private async initStaticIpAddress(
    service: CnCloudProviderService,
    lab: CnLab,
    cloudProviderName: string
  ): Promise<{ lab: CnLab; ipAddress: CnCpStaticIpAddress | null }> {
    let ipAddress: CnCpStaticIpAddress | null = null;
    if (!service.needStaticIpAddressBeforeInstance()) {
      return { lab, ipAddress };
    }

    if (!lab.serverIpAddressId) {
      // Creating the static IP address
      ipAddress = await this.createStaticIpAddress(service, lab);
      lab = await this.labService.updatePartial(lab.id, { serverIpAddressId: ipAddress.id });
    } else {
      ipAddress = await service.getIpAddressFromId(lab.serverIpAddressId, this.getLabRegionName(lab));
      if (ipAddress == null) {
        throw new BlBadRequestException(
          `Static IP address ${lab.serverIpAddressId} not found in cloud provider ${cloudProviderName}`
        );
      }
      this.logger.log(
        `Static IP address ${lab.serverIpAddressId} already exists for lab ${lab.id}. Skipping creation`
      );
    }
    return { lab, ipAddress };
  }

  /**
   * Create the server instance if the lab has none, otherwise check the referenced
   * instance still exists in the cloud provider.
   */
  private async initServerInstance(
    service: CnCloudProviderService,
    lab: CnLab,
    ipAddress: CnCpStaticIpAddress | null,
    labVolume: CnLabVolume
  ): Promise<CnLab> {
    if (!lab.serverInstanceId) {
      return await this.createLab(service, lab, ipAddress ?? undefined, labVolume);
    }

    // Verify the instance still exists in the cloud provider (throws CnInstanceNotFoundException if not)
    await service.getInstance(lab.serverInstanceId, this.getLabRegionName(lab));
    this.logger.log(
      `Server instance ${lab.serverInstanceId} already exists for lab ${lab.id}. Skipping creation`
    );
    return lab;
  }

  /**
   * Create the volume if the lab has none, otherwise check the referenced volume still
   * exists in the cloud provider (only when the provider creates volumes separately).
   */
  private async initServerVolume(
    service: CnCloudProviderService,
    lab: CnLab,
    labVolume: CnLabVolume,
    cloudProviderName: string
  ): Promise<CnLab> {
    if (!lab.serverVolumeId) {
      if (!service.volumeIsCreatedSeparately()) {
        throw new BlBadRequestException("The volume should be created but it doesn't exist");
      }
      return await this.createVolume(service, lab, labVolume);
    }

    if (service.volumeIsCreatedSeparately()) {
      const serverVolume = await service.getVolume(lab.serverVolumeId, this.getLabRegionName(lab));
      if (serverVolume == null) {
        throw new BlBadRequestException(
          `Volume ${lab.serverVolumeId} not found in cloud provider ${cloudProviderName}`
        );
      }
      this.logger.log(`Volume ${lab.serverVolumeId} already exists for lab ${lab.id}. Skipping creation`);
    }
    return lab;
  }

  /**
   * Attach the volume to the instance, or check it is already attached to it.
   */
  private async initVolumeAttachment(
    service: CnCloudProviderService,
    lab: CnLab,
    serverWithInstance: CnCpInstanceWithVolume
  ): Promise<void> {
    if (serverWithInstance.volume.status === 'AVAILABLE') {
      await this.attachVolumeToInstance(service, lab);
      return;
    }

    // check that the volume is attached to the instance
    if (
      !(await service.volumeIsAttachedToInstance(
        serverWithInstance.instance.id,
        serverWithInstance.volume.id,
        this.getLabRegionName(lab)
      ))
    ) {
      throw new BlBadRequestException(
        `For lab ${lab.id}, volume ${serverWithInstance.volume.id} ` +
          `is not attached to instance ${serverWithInstance.instance.id}.'`
      );
    }
    this.logger.log(
      `Volume ${serverWithInstance.volume.id} was already attached to lab ${lab.id}. Skipping attachment`
    );
  }

  private async createStaticIpAddress(
    service: CnCloudProviderService,
    lab: CnLab
  ): Promise<CnCpStaticIpAddress> {
    if (!service.needStaticIpAddressBeforeInstance()) {
      this.logger.debug(
        `Static IP address not needed for cloud provider ${service.getName()} before instance ` +
          `creation for lab ${lab.id}`
      );
      throw new BlBadRequestException(
        `Static IP address not needed for cloud provider ${service.getName()} before instance creation`
      );
    }
    const regionName = this.getLabRegionName(lab);

    if (!lab.cloudName) {
      throw new BlBadRequestException(`Lab ${lab.id} has no cloud name`);
    }

    await this.labService.updateServerTask(
      lab.id,
      `Creating static IP address in cloud provider ${service.getName()} `,
      CnLabServerTaskStatus.RUNNING
    );
    this.logger.log(`Creating static IP address for lab ${lab.id} in cloud provider ${service.getName()}`);
    const staticIpAddress = await service.createStaticIpAddress(lab.cloudName, regionName);
    if (staticIpAddress == null) {
      throw new BlBadRequestException(
        `Cloud provider ${service.getName()} did not return a static IP address for lab ${lab.id}`
      );
    }
    this.logger.log(
      `Static IP address ${staticIpAddress.id} created for lab ${lab.id} ` +
        `in cloud provider ${service.getName()}`
    );
    return staticIpAddress;
  }

  private async createLab(
    service: CnCloudProviderService,
    lab: CnLab,
    ipAddress?: CnCpStaticIpAddress,
    labVolume?: CnLabVolume
  ): Promise<CnLab> {
    const regionName = this.getLabRegionName(lab);

    const labServer = await this.labService.getLabServerCloud(lab.id);

    if (!labServer) {
      throw new BlBadRequestException(`Server cloud not found for lab ${lab.id}`);
    }

    if (!lab.cloudName) {
      throw new BlBadRequestException(`Lab ${lab.id} has no cloud name`);
    }

    if (lab.billingMode == null) {
      throw new BlBadRequestException(`Lab ${lab.id} has no billing mode`);
    }

    await this.labService.updateServerTask(
      lab.id,
      `Creating server instance ${labServer.technicalName} in cloud provider ${service.getName()}`,
      CnLabServerTaskStatus.RUNNING
    );
    this.logger.log(
      `Creating server instance ${lab.cloudName} ${labServer.technicalName} for lab ` +
        `${lab.id} in cloud provider ${service.getName()}`
    );
    const instanceRequest: CnCpCreateInstanceRequest = {
      name: lab.cloudName,
      region: regionName,
      serverName: labServer.technicalName,
      billing: lab.billingMode,
      ipAddress: ipAddress,
    };

    let serverInstance: CnCpInstance;

    if (service.volumeIsCreatedSeparately()) {
      serverInstance = await service.createInstance(instanceRequest);
      this.logger.log(
        `Instance ${serverInstance.id} created for lab ${lab.id} in cloud provider ${service.getName()}`
      );

      return await this.labService.updatePartial(lab.id, { serverInstanceId: serverInstance.id });
    } else {
      if (labVolume == null) {
        throw new BlBadRequestException(`Lab ${lab.id} has no volume to create the instance with`);
      }
      const volumeRequest: CnCpCreateVolumeRequest = this.getLabVolumeRequest(lab, labVolume);
      const serverWithVolume = await service.createInstanceWithVolume(instanceRequest, volumeRequest);

      this.logger.log(
        `Instance ${serverWithVolume.instance.id} and volume ${serverWithVolume.volume.id} created ` +
          `for lab ${lab.id} in cloud provider ${service.getName()}`
      );
      return await this.labService.updatePartial(lab.id, {
        serverInstanceId: serverWithVolume.instance.id,
        serverVolumeId: serverWithVolume.volume.id,
      });
    }
  }

  private async createVolume(
    service: CnCloudProviderService,
    lab: CnLab,
    labVolume: CnLabVolume
  ): Promise<CnLab> {
    const volumeRequest: CnCpCreateVolumeRequest = this.getLabVolumeRequest(lab, labVolume);

    await this.labService.updateServerTask(
      lab.id,
      `Creating volume in cloud provider ${service.getName()}`,
      CnLabServerTaskStatus.RUNNING
    );
    this.logger.log(`Creating volume for lab ${lab.id} in cloud provider ${service.getName()}`);
    const volume = await service.createVolume(volumeRequest);
    this.logger.log(`Volume ${volume.id} created for lab ${lab.id} in cloud provider ${service.getName()}`);
    return await this.labService.updatePartial(lab.id, { serverVolumeId: volume.id });
  }

  private getLabVolumeRequest(lab: CnLab, labVolume: CnLabVolume): CnCpCreateVolumeRequest {
    if (!lab.cloudName) {
      throw new BlBadRequestException(`Lab ${lab.id} has no cloud name`);
    }
    return {
      name: lab.cloudName,
      description: 'Volume for lab ' + lab.name,
      size: labVolume.size,
      type: labVolume.type,
      region: this.getLabRegionName(lab),
    };
  }

  private async waitForInstanceAndVolume(
    service: CnCloudProviderService,
    lab: CnLab
  ): Promise<CnCpInstanceWithVolume> {
    if (!lab.serverInstanceId) {
      throw new BlBadRequestException(`Lab ${lab.id} has no server instance`);
    }
    if (!lab.serverVolumeId) {
      throw new BlBadRequestException(`Lab ${lab.id} has no server volume`);
    }
    const serverWithVolume = await this.pollInstanceAndVolume(
      service,
      lab,
      lab.serverInstanceId,
      lab.serverVolumeId
    );

    this.checkInstanceAndVolumeAreReady(serverWithVolume);

    return serverWithVolume;
  }

  /**
   * Poll the instance and the volume until both left the CREATING state, or until the
   * wait budget is exhausted. Returns their last known state, ready or not.
   */
  private async pollInstanceAndVolume(
    service: CnCloudProviderService,
    lab: CnLab,
    serverInstanceId: string,
    serverVolumeId: string
  ): Promise<CnCpInstanceWithVolume> {
    let serverInstance: CnCpInstance = await service.getInstance(
      serverInstanceId,
      this.getLabRegionName(lab)
    );
    let serverVolume: CnCpVolume = await service.getVolume(serverVolumeId, this.getLabRegionName(lab));

    // Waiting for the server and the volume to be ready
    let count = 0;
    while (
      (serverInstance.status.status === 'CREATING' || serverVolume.status === 'CREATING') &&
      count < 10
    ) {
      if (count === 0) {
        await this.labService.updateServerTask(
          lab.id,
          'Waiting for server and volume to be ready',
          CnLabServerTaskStatus.RUNNING
        );
      }
      // wait 30 seconds
      this.logger.log(
        `Waiting for instance ${lab.serverInstanceId} and volume ${lab.serverVolumeId} to be` +
          ` ready for lab ${lab.id} in cloud provider ${service.getName()}. Count: ${count}`
      );
      await new Promise((r) => setTimeout(r, 30000));

      // refresh lab if needed
      if (serverInstance.status.status !== 'RUNNING') {
        serverInstance = await service.getInstance(serverInstanceId, this.getLabRegionName(lab));
      }

      // refresh volume if needed
      if (serverVolume.status !== 'AVAILABLE') {
        serverVolume = await service.getVolume(serverVolumeId, this.getLabRegionName(lab));
      }

      // break early if resources are being deleted
      if (serverVolume.status === 'DELETING' || serverInstance.status.status === 'ERROR') {
        break;
      }

      count++;
    }

    return {
      instance: serverInstance,
      volume: serverVolume,
    };
  }

  /**
   * Throw a user facing error if the instance or the volume was deleted meanwhile,
   * or is still not ready.
   */
  private checkInstanceAndVolumeAreReady(serverWithVolume: CnCpInstanceWithVolume): void {
    const serverInstance = serverWithVolume.instance;
    const serverVolume = serverWithVolume.volume;

    if (serverVolume.status === 'DELETING' || serverInstance.status.status === 'ERROR') {
      throw new BlBadRequestException(
        'Server instance or volume was deleted during initialization, please retry or contact support'
      );
    }
    if (serverInstance.status.status === 'CREATING') {
      throw new BlBadRequestException(
        'Server instance not ready, please refresh the status if few minutes and then contact the' +
          ' support if the problem persists,'
      );
    }
    if (serverVolume.status === 'CREATING') {
      throw new BlBadRequestException(
        'Volume not ready, please refresh the status if few minutes and then contact' +
          ' the support if the problem persist,s'
      );
    }
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
        'The ip adresse of the server is not available, please retry in few minutes and' +
          ' contact the support if the problem persists'
      );
    }
    await this.labService.updateServerTask(
      lab.id,
      'Creating DNS record for the lab',
      CnLabServerTaskStatus.RUNNING
    );
    this.logger.log(`Creating domain record for lab ${lab.id} with subdomain ${subDomainName}`);
    try {
      await this.ovhCloudProviderService.createLabDomainHostRecord(ipv4, mainDomain, subDomainName);
    } catch (e) {
      throw new Error(
        `Error while creating domain record for lab. Error: ${e instanceof Error ? e.message : String(e)}`,
        { cause: e }
      );
    }
    this.logger.log(`Domain record created for lab ${lab.id} with subdomain ${subDomainName}`);
    await this.labService.updatePartial(lab.id, { dnsConfigured: true });
  }

  private async attachVolumeToInstance(service: CnCloudProviderService, lab: CnLab): Promise<CnCpVolume> {
    if (!lab.serverInstanceId) {
      throw new BlBadRequestException(`Lab ${lab.id} has no server instance`);
    }
    if (!lab.serverVolumeId) {
      throw new BlBadRequestException(`Lab ${lab.id} has no server volume`);
    }
    await this.labService.updateServerTask(
      lab.id,
      'Attaching volume to server instance',
      CnLabServerTaskStatus.RUNNING
    );
    this.logger.log(
      `Attaching volume ${lab.serverVolumeId} to instance ${lab.serverInstanceId} for` +
        ` lab ${lab.id} in cloud provider ${service.getName()}`
    );
    const volume = await service.attachVolumeToInstance(
      lab.serverInstanceId,
      lab.serverVolumeId,
      this.getLabRegionName(lab)
    );
    this.logger.log(
      `Volume ${volume.id} attached to instance ${lab.serverInstanceId} for` +
        ` lab ${lab.id} in cloud provider ${service.getName()}`
    );
    return volume;
  }

  public async deleteLabServerAndVolume(lab: CnLab): Promise<void> {
    const cloudProviderService = await this.cloudProviderFactory.getCloudProviderServiceFromLab(lab.id);

    await this.deleteServerInstance(cloudProviderService, lab);
    await this.deleteServerIpAddress(cloudProviderService, lab);
    await this.deleteServerVolume(cloudProviderService, lab);
    // delete domain record
    await this.deleteLabDomainRecord(lab);
  }

  private async deleteServerInstance(service: CnCloudProviderService, lab: CnLab): Promise<void> {
    if (lab.serverInstanceId) {
      this.logger.log(`Deleting server instance ${lab.serverInstanceId} for lab ${lab.id}`);
      await service.deleteInstance(lab.serverInstanceId, this.getLabRegionName(lab));
      const serverInstanceId = lab.serverInstanceId;
      await this.labService.updatePartial(lab.id, { serverInstanceId: null });
      this.logger.log(`Server instance ${serverInstanceId} deleted for lab ${lab.id}`);
    } else {
      this.logger.log(`No server instance for lab ${lab.id}`);
    }
  }

  private async deleteServerIpAddress(service: CnCloudProviderService, lab: CnLab): Promise<void> {
    if (lab.serverIpAddressId) {
      if (!service.needStaticIpAddressBeforeInstance()) {
        throw new BlBadRequestException(
          'The data lab has a static ip address but the cloud provider does not need it'
        );
      }
      this.logger.log(`Deleting static IP address ${lab.serverIpAddressId} for lab ${lab.id}`);
      await service.deleteIpAddress(lab.serverIpAddressId, this.getLabRegionName(lab));
      const ipAddressId = lab.serverIpAddressId;
      await this.labService.updatePartial(lab.id, { serverIpAddressId: null });
      this.logger.log(`Static IP address ${ipAddressId} deleted for lab ${lab.id}`);
    }
  }

  private async deleteServerVolume(service: CnCloudProviderService, lab: CnLab): Promise<void> {
    if (lab.serverVolumeId) {
      this.logger.log(`Deleting volume ${lab.serverVolumeId} for lab ${lab.id}`);
      await service.deleteVolume(lab.serverVolumeId, this.getLabRegionName(lab));
      const volumeId = lab.serverVolumeId;
      await this.labService.updatePartial(lab.id, { serverVolumeId: null });
      this.logger.log(`Volume ${volumeId} deleted for lab ${lab.id}`);
    } else {
      this.logger.log(`No volume for lab ${lab.id}. Skipping deletion`);
    }
  }

  private async deleteLabDomainRecord(lab: CnLab): Promise<void> {
    const mainDomain = lab.getMainDomain();
    const subDomainName = lab.getSubDomainName();
    const domainExists = await this.ovhCloudProviderService.labDomainRecordExists(mainDomain, subDomainName);
    // check if the domain record already exists
    if (domainExists) {
      this.logger.log(`Deleting domain record ${lab.virtualHost} for lab ${lab.id}`);
      await this.ovhCloudProviderService.deleteLabDomainHostRecord(
        lab.getMainDomain(),
        lab.getSubDomainName()
      );
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

    const serverInstance = await cloudProviderService.getInstance(
      lab.serverInstanceId,
      this.getLabRegionName(lab)
    );

    if (
      serverInstance.status.status === 'CREATING' ||
      serverInstance.status.status === 'RESTARTING' ||
      serverInstance.status.status === 'STOPPING'
    ) {
      throw new BlBadRequestException(`Server is currently ${serverInstance.status.status}`);
    }

    // if the server is stopped
    const user = CnCurrentUserHelper.getAndCheckCurrentUser();
    this.logger.log(`Starting server instance ${lab.serverInstanceId} for lab ${lab.id} by ${user.email}`);
    try {
      await cloudProviderService.startInstance(lab.serverInstanceId, this.getLabRegionName(lab));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      this.logger.error(
        `Error while starting instance ${lab.serverInstanceId} for lab ${lab.id}. Error: ${errorMessage}`
      );
      await this.labService.updateServerTask(
        lab.id,
        `Error starting server: ${errorMessage}`,
        CnLabServerTaskStatus.ERROR
      );
      throw err;
    }
    return await this.labService.markInstanceAsServerStarting(lab.id);
  }

  public async stopLab(lab: CnLab): Promise<CnLab> {
    const cloudProviderService = await this.checkBeforeStopLab(lab);
    if (!lab.serverInstanceId) {
      throw new BlBadRequestException(`Lab has no server instance was it correctly initialized?`);
    }

    // if the server is running
    const user = CnCurrentUserHelper.getAndCheckCurrentUser();
    this.logger.log(`Stopping server instance ${lab.serverInstanceId} for lab ${lab.id} by ${user.email}`);
    await cloudProviderService.stopInstance(lab.serverInstanceId, this.getLabRegionName(lab));
    return await this.labService.markInstanceAsServerStopping(lab.id);
  }

  public async restartLab(lab: CnLab): Promise<CnLab> {
    if (!lab.serverInstanceId) {
      throw new BlBadRequestException(`Lab has no server instance was it correctly initialized?`);
    }

    const cloudProviderService = await this.cloudProviderFactory.getCloudProviderServiceFromLab(lab.id);

    const serverInstance = await cloudProviderService.getInstance(
      lab.serverInstanceId,
      this.getLabRegionName(lab)
    );

    // a soft reboot only makes sense on a running instance
    if (serverInstance.status.status !== 'RUNNING') {
      throw new BlBadRequestException(`Server is currently ${serverInstance.status.status}`);
    }

    const user = CnCurrentUserHelper.getAndCheckCurrentUser();
    this.logger.log(`Restarting server instance ${lab.serverInstanceId} for lab ${lab.id} by ${user.email}`);
    try {
      await cloudProviderService.restartInstance(lab.serverInstanceId, this.getLabRegionName(lab));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      this.logger.error(
        `Error while restarting instance ${lab.serverInstanceId} for lab ${lab.id}. Error: ${errorMessage}`
      );
      await this.labService.updateServerTask(
        lab.id,
        `Error restarting server: ${errorMessage}`,
        CnLabServerTaskStatus.ERROR
      );
      throw err;
    }
    return await this.labService.markInstanceAsServerStarting(lab.id);
  }

  public async checkBeforeStopLab(lab: CnLab): Promise<CnCloudProviderService> {
    if (!lab.serverInstanceId) {
      throw new BlBadRequestException(`Lab has no server instance was it correctly initialized?`);
    }

    const cloudProviderService = await this.cloudProviderFactory.getCloudProviderServiceFromLab(lab.id);

    const serverInstance = await cloudProviderService.getInstance(
      lab.serverInstanceId,
      this.getLabRegionName(lab)
    );

    if (serverInstance.status.status !== 'RUNNING') {
      throw new BlBadRequestException(`Server is currently ${serverInstance.status.status}`);
    }

    return cloudProviderService;
  }

  /**
   * Check if the lab has any activity (running scenarios, queued scenarios, dev environment running)
   * @param lab
   * @param throwErrorOnActivityGetError if true, throw an error if the activity cannot be retrieved
   */
  public async checkLabActivity(lab: CnLab, throwErrorOnActivityGetError: boolean = false): Promise<void> {
    // check if there are any running containers
    const labActivity = await this.externalLabApiService
      .getLabGlobalActivity(lab.getGlabSpaceApiInfo())
      .catch((error): null => {
        if (throwErrorOnActivityGetError) {
          throw error;
        }
        this.logger.error(`Could not get lab activity for lab ${lab.id}. Error: ${error}`);
        return null;
      });

    if (labActivity == null) return;

    if (labActivity.running_scenarios > 0) {
      throw new BlBadRequestException(
        `Lab has ${labActivity.running_scenarios} running scenarios. Please stop them first`
      );
    }

    if (labActivity.queued_scenarios > 0) {
      throw new BlBadRequestException(
        `Lab has ${labActivity.queued_scenarios} queued scenarios. Please remove them form queue first`
      );
    }

    if (labActivity.dev_env_running) {
      throw new BlBadRequestException(`The dev environment is running. Please stop it first`);
    }
  }

  public async getLabServerStatus(lab: CnLab): Promise<CnCpInstanceStatusObject> {
    if (lab.serverInstanceId == null) {
      throw new BlBadRequestException(`Lab has no server instance, it cannot be fetched`);
    }
    const cloudProviderService = await this.cloudProviderFactory.getCloudProviderServiceFromLab(lab.id);
    const serverInstance = await cloudProviderService.getInstance(
      lab.serverInstanceId,
      this.getLabRegionName(lab)
    );
    return serverInstance.status;
  }

  ///////////////////////////////// DNS CHALLENGE /////////////////////////////////

  public async generateDnsChallengeForLab(lab: CnLab, data: CnLabManagerCreateDnsChallenge): Promise<void> {
    return this.ovhCloudProviderService.createDnsChallengeForLab(
      lab.getMainDomain(),
      lab.getSubDomainName(),
      data.value
    );
  }

  public async cleanupDnsChallenge(lab: CnLab): Promise<void> {
    return this.ovhCloudProviderService.deleteDnsChallengeForLab(lab.getMainDomain(), lab.getSubDomainName());
  }
}
