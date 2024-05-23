import {Injectable, Logger} from '@nestjs/common';
import {
  CnLabDomain,
  CnLabInstance,
  CnLabInstanceBillingMode,
  CnLabInstanceType,
  CnLabInstanceVolumeType
} from './cn-lab-instance.entity';
import {CnLabInstancesService} from './cn-lab-instances.service';
import {CnLabInstanceStatusHistory} from './status/cn-lab-instance-status-history.entity';
import {CnErrorText} from '../cn-core/model/config/cn-error-text.class';
import {
  CnExternalLabBackupInfoDTO,
  CnExternalLabUser,
  CnExternalLabUserRole
} from '../cn-external-lab-api/model/cn-external-lab-api.class';
import {ClPage, ClPageI, ClStringHelper} from '@monorepo/core-lib';
import {CnCurrentUserHelper} from '../cn-core/utils/cn-current-user.helper';
import {
  CnLabManagerComposeUpOptions,
  CnLabManagerDockerPs,
  CnLabManagerDockerPsFull,
  CnManagerLabComposeRestartOptions,
  CnManagerLabPullBiotaOptions
} from '../cn-external-lab-api/model/cn-lab-manager.class';
import {CnLabManagerService} from './cn-lab-manager.service';
import {CnLabInstanceToken} from './user/cn-lab-instance-token.class';
import {
  CnLabCloudCreateDTO,
  CnLabFindOneDto,
  CnLabInstanceConfigDTO,
  CnLabInstanceCreateAdminDTO,
  CnLabInstanceCreateDesktopDTO,
  CnLabInstanceDesktopConfig,
  CnLabInstanceStartDTO,
  CnLabInstanceStatusDTO,
  CnLabInstanceUpdateAdminDTO,
  CnLabServerInfoDTO,
  CnRequestLabInstance
} from './cn-lab-instance.dto';
import {CnLabConfig} from '../cn-lab-configs/cn-lab-config.entity';
import {CnLabInstancesSecurity} from './cn-lab-instances.security';
import {
  BlBadRequestException,
  BlCredentials,
  BlDtoHelper,
  BlExternalApiError,
  BlSearchParams,
  BlUnauthorizedException
} from '@monorepo/back-core-lib';
import {CnLabInstanceUser, CnLabInstanceUserRole} from './user/cn-lab-instance-user.entity';
import {CnExternalLabUserService} from '../cn-external-lab-api/cn-external-lab-user.service';
import {CnExternalLabApiService} from '../cn-external-lab-api/cn-external-lab-api.service';
import {CnLabInstanceUserService} from './user/cn-lab-instance-user.service';
import {DataSource, EntityManager} from 'typeorm';
import {CnLabInstanceProject} from './project/cn-lab-instance-project.entity';
import {CnLabInstanceProjectService} from './project/cn-lab-instance-project.service';
import {CnProjectAggregateService} from '../cn-projects-aggregate/cn-project-aggregate.service';
import {CnExternalLabProjectService} from '../cn-external-lab-api/cn-external-lab-project.service';
import {CnUsersService} from '../cn-users/cn-users.service';
import {CnProject} from '../cn-projects-aggregate/cn-projects/cn-project.entity';
import {CnCpCompleteInfo} from './server/cn-cloud-provider.class';
import {CnLabServerService} from './server/cn-lab-server.service';
import {CnLabConfigurerService} from './server/cn-lab-configurer.service';
import {CnUser} from '../cn-users/cn-user.entity';
import {CnLabConfigsService} from '../cn-lab-configs/cn-lab-configs.service';
import {CnLabDesktopConfig, CnLabInstanceDesktopService} from './desktop/cn-lab-instance-desktop.service';
import {CnBrickGWS} from '../cn-bricks/cn-brick.dto';
import {CnLabMailService} from './mail/cn-lab-mail.service';
import {CnLabGreenOption} from './green-option/cn-lab-green-option.entity';
import {CnLabGreenOptionService} from './green-option/cn-lab-green-option.service';
import {CnLabGreenOptionFormDto} from './green-option/cn-lab-green-option.dto';
import {CnAuthService, CnExternalCheckCredentialResponse} from '../cn-auth/cn-auth.service';
import {CnLabInstanceServerTaskStatus, CnLabInstanceStatus} from './status/cn-lab-instance-status.enum';
import {CnLabInstanceStatusService} from './status/cn-lab-instance-status.service';
import {CnLabInstanceStatusRunRequest, CnLabInstanceStatusRunResponse} from './status/cn-lab-instance-status.dto';
import {CnLabFreeTrialService} from './free-trial/cn-lab-free-trial.service';
import {CnLabBackupBucket, CnLabBackupStatusDTO} from './backup/cn-lab-backup.dto';
import {CnLabBackupHistory} from './backup/cn-lab-backup-history.entity';
import {CnCloudProviderRegion} from '../cn-cloud-providers/cn-cloud-provider-regions/cn-cloud-provider-region.entity';
import {CnCloudProviderFactory} from './server/cn-cloud-provider.factory';
import {CnServerPriceService} from '../cn-servers-info/server-price/cn-server-price.service';
import {CnServerPrices} from '../cn-servers-info/server-price/cn-server-price.dto';
import {CnLabConfigDto} from '../cn-lab-configs/cn-lab-config.dto';
import {CnLabBackupAggregateService} from './backup/cn-lab-backup-aggregate.service';


@Injectable()
export class CnLabInstanceAggregateService {

  private readonly logger = new Logger(CnLabInstanceAggregateService.name);


  constructor(private labInstancesService: CnLabInstancesService,
              private labInstanceUserService: CnLabInstanceUserService,
              private labInstanceProjectService: CnLabInstanceProjectService,
              private labManagerService: CnLabManagerService,
              private security: CnLabInstancesSecurity,
              private usersService: CnUsersService,
              private projectAggregateService: CnProjectAggregateService,
              private externalLabUserService: CnExternalLabUserService,
              private externalLabProjectService: CnExternalLabProjectService,
              private externalLabApiService: CnExternalLabApiService,
              private dataSource: DataSource,
              private labServerService: CnLabServerService,
              private labConfigurerService: CnLabConfigurerService,
              private cloudProviderFactory: CnCloudProviderFactory,
              private labConfigService: CnLabConfigsService,
              private labInstanceDesktopService: CnLabInstanceDesktopService,
              private labMailService: CnLabMailService,
              private labGreenOptionService: CnLabGreenOptionService,
              private authService: CnAuthService,
              private labStatusService: CnLabInstanceStatusService,
              private freeTrialService: CnLabFreeTrialService,
              private backupService: CnLabBackupAggregateService,
              private serverPriceService: CnServerPriceService) {
  }

  /**
   * Create a lab instance with all information (only for admin)
   */
  async createAdmin(createLabInstance: CnLabInstanceCreateAdminDTO): Promise<CnLabInstance> {
    const labInstance = BlDtoHelper.fromDto(CnLabInstance, createLabInstance);

    const userInfo = CnCurrentUserHelper.getAndCheckUserSpaceInfo();
    this.security.checkAuthorizationToCreateAdmin(labInstance, userInfo);

    return this.dataSource.transaction(async entityManager => {
      return this.createLabNotSecure(labInstance, createLabInstance.dailyBackupRegion, createLabInstance.weeklyBackupRegion, entityManager);
    });
  }

  /**
   * Route accessible by users to create a cloud lab instance
   * @param cloudCreateDTO
   */
  public async createCloudLab(cloudCreateDTO: CnLabCloudCreateDTO): Promise<CnLabInstance> {
    const labInstance = new CnLabInstance();
    labInstance.name = cloudCreateDTO.name;
    labInstance.type = CnLabInstanceType.CLOUD;
    labInstance.serverCloud = cloudCreateDTO.serverCloud;
    labInstance.region = cloudCreateDTO.region;
    labInstance.billingMode = CnLabInstanceBillingMode.HOURLY;
    labInstance.volumeSize = cloudCreateDTO.volumeSize;
    labInstance.volumeType = CnLabInstanceVolumeType.HIGH_SPEED;
    labInstance.isFreeTrial = false;
    labInstance.space = CnCurrentUserHelper.getCurrentSpace();
    labInstance.virtualHost = ClStringHelper.generateUUID() + '.' + CnLabDomain.CONSTELLAB_APP;

    // handle lab config
    const configDto: CnLabConfigDto = {
      version: 1,
      brick_versions: cloudCreateDTO.labConfig.brickVersions
    };
    labInstance.labConfig = await this.labConfigService.getOrCreateLabConfig(configDto);

    const labInstanceDb = await this.dataSource.transaction(async entityManager => {
      const labInstanceDb = await this.createLabNotSecure(labInstance, cloudCreateDTO.dailyBackupRegion,
        cloudCreateDTO.weeklyBackupRegion, entityManager);

      await this.labInstanceUserService.createLabInstanceUser(labInstance, CnCurrentUserHelper.getAndCheckCurrentUser(),
        CnLabInstanceUserRole.OWNER, entityManager);

      return labInstanceDb;
    });

    // init the server asynchronously
    await this.initServer(labInstance.id);

    return labInstanceDb;
  }

  public async createLabNotSecure(labInstance: CnLabInstance,
                                  dailyBackupRegion: CnCloudProviderRegion,
                                  weeklyBackupRegion: CnCloudProviderRegion,
                                  entityManager: EntityManager): Promise<CnLabInstance> {
    const labInstanceDb: CnLabInstance = await this.labInstancesService.create(labInstance, entityManager);

    if (labInstance.isCloud()) {
      await this.backupService.createBackupOptions(labInstanceDb,
        dailyBackupRegion, weeklyBackupRegion, entityManager);
    }

    return labInstanceDb;
  }

  /**
   * Update a lab instance with all information (only for admin)
   */
  async updateAdmin(updateLabInstance: CnLabInstanceUpdateAdminDTO): Promise<CnLabInstance> {
    await this.getAndCheckAuthorizationToUpdateAdmin(updateLabInstance.id);
    const labInstance = BlDtoHelper.fromDto(CnLabInstance, updateLabInstance);

    return this.labInstancesService.update(labInstance);
  }

  /**
   * Accessible by any user to create his own desktop lab instance
   * @param createLabInstance
   */
  async createDesktop(createLabInstance: CnLabInstanceCreateDesktopDTO): Promise<CnLabInstance> {
    const labInstance = new CnLabInstance();
    labInstance.name = createLabInstance.name;
    labInstance.desktopPlatform = createLabInstance.desktopPlatform;
    labInstance.type = CnLabInstanceType.DESKTOP;

    const userInfo = CnCurrentUserHelper.getAndCheckUserSpaceInfo();
    labInstance.setSpace(userInfo.space);

    this.security.checkAuthorizationCreateDesktopLabInstance(labInstance);

    return this.dataSource.transaction(async entityManager => {
      const labInstanceDb = await this.labInstancesService.create(labInstance, entityManager);

      // add the user as OWNER of his lab
      await this.labInstanceUserService.createLabInstanceUser(labInstance, userInfo.user, CnLabInstanceUserRole.OWNER, entityManager);
      return labInstanceDb;
    });
  }

  /**
   * Update accessible for any owner of the lab, he can update only few parameters
   */
  async updateDesktopLab(id: string, updateLabInstance: CnLabInstanceCreateDesktopDTO): Promise<CnLabInstance> {
    const labInstanceDb: CnLabInstance = await this.labInstancesService.findByIdAndCheck(id);

    if (!labInstanceDb.isDesktop()) {
      throw new BlUnauthorizedException();
    }
    await this.security.checkAuthorizationToManageLab(labInstanceDb, CnCurrentUserHelper.getAndCheckUserSpaceInfo());

    return this.labInstancesService.updatePartial(id, {
      name: updateLabInstance.name,
      desktopPlatform: updateLabInstance.desktopPlatform
    });
  }

  async updateLabName(id: string, name: string): Promise<CnLabInstance> {
    const labInstanceDb: CnLabInstance = await this.labInstancesService.findByIdAndCheck(id);
    await this.security.checkAuthorizationToManageLab(labInstanceDb, CnCurrentUserHelper.getAndCheckUserSpaceInfo());
    return this.labInstancesService.updateLabName(id, name);
  }

  async delete(id: string): Promise<void> {
    const labInstance = await this.getAndCheckAuthorizationToUpdateAdmin(id);

    await this.dataSource.transaction(async entityManager => {
      await this.backupService.deleteBackupOptions(labInstance, entityManager);
      await this.labInstancesService.deleteById(id, entityManager);
    });
  }

  async requestLabInstance(request: CnRequestLabInstance): Promise<void> {
    const userInfo = CnCurrentUserHelper.getAndCheckUserSpaceInfo();
    return this.labMailService.sendRequestLabInstanceMail(request, userInfo.user, userInfo.space);
  }


  async findByIdAndCheck(id: string): Promise<CnLabFindOneDto> {
    const labInstance = await this.labInstancesService.findByIdAndCheck(id);
    const userRole = await this.security.checkAuthorizationToFindById(labInstance, CnCurrentUserHelper.getAndCheckUserSpaceInfo());
    return CnLabFindOneDto.create(labInstance, userRole);
  }

  async getByCurrentSpace(page: number, size: number): Promise<ClPageI<CnLabInstance>> {
    this.security.checkAuthorizationToFindAllBySpace(CnCurrentUserHelper.getAndCheckUserSpaceInfo());
    return this.labInstancesService.findBySpace(CnCurrentUserHelper.getCurrentSpace().id, page, size);
  }

  getCurrentLabInstances(page: number, size: number): Promise<ClPageI<CnLabInstance>> {
    // no security check because the get is filtered with user id
    return this.labInstancesService.getCurrentLabInstances(page, size);
  }

  getCurrentRunningLabInstances(): Promise<CnLabInstance[]> {
    // no security check because the get is filtered with user id
    return this.labInstancesService.getCurrentRunningLabInstances();
  }

  async searchAll(searchParams: BlSearchParams, page: number, size: number): Promise<ClPage<CnLabInstance>> {
    this.security.checkAuthorizationToFindAll(CnCurrentUserHelper.getAndCheckUserSpaceInfo());

    return this.labInstancesService.searchAll(searchParams, page, size);
  }

  async searchInCurrentSpace(searchParams: BlSearchParams, page: number, size: number): Promise<ClPage<CnLabInstance>> {
    this.security.checkAuthorizationToFindAllBySpace(CnCurrentUserHelper.getAndCheckUserSpaceInfo());

    return this.labInstancesService.searchInSpace(CnCurrentUserHelper.getAndCheckUserSpaceInfo().spaceId,
      searchParams, page, size);
  }

  public async getConfig(id: string): Promise<CnLabConfig> {
    const lab = await this.getAndCheckAuthorizationToFindById(id);

    if (lab.labConfigId == null) {
      throw new BlBadRequestException(CnErrorText.LAB_CONFIG_NOT_FOUND);
    }


    return this.labConfigService.getCompleteConfig(lab.labConfigId);
  }

  /**
   * Update the lab bricks config.
   * If the lab is desktop, the config is updated directly in the lab instance.
   * If the lab is on cloud, it only updates the lab manager config (the config is then update when the lab is restarted)
   * @param labId
   * @param config
   */
  public async updateConfig(labId: string, config: CnLabInstanceConfigDTO): Promise<void> {
    // check if the gws core is in the brick list
    const gwsCore = config.brickVersions.find(brickVersion => brickVersion.name.toLowerCase() === CnBrickGWS.GWS_CORE.toLowerCase());

    if (gwsCore == null) {
      throw new BlBadRequestException(`The brick '${CnBrickGWS.GWS_CORE}' must be set in the config`);
    }

    const labInstance: CnLabInstance = await this.getAndCheckAuthorizationToManageLab(labId, false);

    if (labInstance.isHttpAccessible()) {
      await this.labManagerService.updateConfig(labInstance, config);
    } else {
      // for on desktop, we need to update the lab config directly (there is no lab manager)
      const labConfig = await this.labConfigService.getOrCreateLabConfig({
        version: 1,
        brick_versions: config.brickVersions,
      });

      await this.updateLabInstanceConfig(labInstance, labConfig);
    }
  }

  private async updateLabInstanceConfig(labInstance: CnLabInstance, labConfig: CnLabConfig): Promise<CnLabInstance> {
    return this.labInstancesService.updateLabConfig(labInstance.id, labConfig);
  }

  public async getLabServerInfo(labInstanceId: string): Promise<CnLabServerInfoDTO> {
    const lab = await this.getAndCheckAuthorizationToFindById(labInstanceId);
    if (!lab.isCloud()) {
      throw new BlBadRequestException('The lab is not on a cloud server');
    }

    const fullLab = await this.labInstancesService.findByIdAndCheck(labInstanceId,
      {serverCloud: true});

    const serverInfo = new CnLabServerInfoDTO();
    serverInfo.name = fullLab.serverCloud.serverStandard.name;
    serverInfo.cloudProvider = fullLab.serverCloud.cloudProvider;
    serverInfo.cpuType = fullLab.serverCloud.cpuType;
    serverInfo.cpuCount = fullLab.serverCloud.cpuCount;
    serverInfo.gpuType = fullLab.serverCloud.gpuType;
    serverInfo.gpuCount = fullLab.serverCloud.gpuCount;
    serverInfo.ram = fullLab.serverCloud.ram;
    serverInfo.volumeSize = fullLab.volumeSize;
    serverInfo.volumeType = fullLab.volumeType;
    return serverInfo;
  }

  /////////////////////////////////////// STATUS  //////////////////////////////////

  public async getLabStatus(id: string): Promise<CnLabInstanceStatusDTO> {
    const labInstance = await this.getAndCheckAuthorizationToFindById(id);
    return this.getStatus(labInstance);
  }

  private async getStatus(labInstance: CnLabInstance): Promise<CnLabInstanceStatusDTO> {
    const promises: [Promise<boolean>, Promise<boolean>] = [
      this.labManagerService.healthCheck(labInstance.getLabManagerApiInfo().apiUrl),
      this.externalLabApiService.healthCheck(labInstance.getGlabSpaceApiInfo())
    ];

    return Promise.all(promises).then(async ([labManagerStatus, glabStatus]) => {
      // if the lab is marked as stopped but the glab is accessible for refresh status
      if (labInstance.isHttpAccessible() && glabStatus && labInstance.currentStatus.status === 'SERVER_STOPPED') {
        labInstance = await this.refreshLabStatus(labInstance.id);
      }

      const labStatus = new CnLabInstanceStatusDTO();
      labStatus.labStatus = labInstance.currentStatus.status;
      labStatus.labManagerIsRunning = labManagerStatus;
      labStatus.labIsRunning = glabStatus;
      labStatus.hasServerInstanceId = !!labInstance.serverInstanceId;
      labStatus.hasServerVolumeId = !!labInstance.serverVolumeId;
      labStatus.dnsConfigured = labInstance.dnsConfigured;
      labStatus.serverTaskText = labInstance.serverTaskText;
      labStatus.serverTaskStatus = labInstance.serverTaskStatus;
      labStatus.serverTaskDatetime = labInstance.serverTaskDatetime;
      return labStatus;
    });

  }

  async getStatusHistory(id: string): Promise<CnLabInstanceStatusHistory[]> {
    // check that the user can get experiment
    await this.getAndCheckAuthorizationToFindById(id);

    return await this.labInstancesService.getStatusHistory(id) as CnLabInstanceStatusHistory[];
  }

  /**
   * Refresh the lab status based on server status
   * @param id
   */
  async checkAndRefreshStatus(id: string): Promise<CnLabInstanceStatusDTO> {
    let labInstance = await this.getAndCheckAuthorizationToFindById(id);

    labInstance = await this.refreshLabStatus(labInstance.id);
    return this.getStatus(labInstance);
  }

  /**
   * Refresh the status of the lab instance based on the status of the server instance
   * @param labInstanceId
   */
  public async refreshLabStatus(labInstanceId: string): Promise<CnLabInstance> {
    const labInstance = await this.labInstancesService.findByIdAndCheck(labInstanceId);
    if (!labInstance.isHttpAccessible()) {
      throw new BlBadRequestException(`Cannot refresh status of a lab that is not on a server`);
    }

    if (labInstance.isCloud()) {
      if (!labInstance.serverInstanceId && !labInstance.serverTaskIsRunning()) {
        return await this.labInstancesService.markInstanceAsNoServer(labInstanceId);
      }

      // manage all the server status, except running
      const serverStatus = await this.labServerService.getLabServerStatus(labInstance);
      if (serverStatus.status === 'CREATING' || serverStatus.status === 'RESTARTING') {
        return await this.labInstancesService.markInstanceAsServerStarting(labInstanceId);
      }
      if (serverStatus.status === 'STOPPING') {
        return await this.labInstancesService.markInstanceAsServerStopping(labInstanceId);
      }
      if (serverStatus.status === 'STOPPED') {
        return await this.labInstancesService.markInstanceAsServerStopped(labInstanceId);
      }
      // Specific case to handle error, mark as stopped and set the error in the server task
      if (serverStatus.status === 'ERROR') {
        const text = serverStatus.message?.length > 0 ? serverStatus.message : 'No information about the error';
        return await this.labInstancesService.markInstanceAsError(labInstanceId, text);
      }
    }

    // if there is a task running, the server is configuring
    // if (labInstance.serverTaskIsRunning()) {
    //   return await this.labInstancesService.markInstanceAsServerConfiguring(labInstanceId);
    // }

    // if the lab is running
    const healthCheck = await this.externalLabApiService.healthCheck(labInstance.getGlabSpaceApiInfo());
    if (healthCheck) {
      return await this.labInstancesService.markInstanceAsLabRunning(labInstanceId);
    }

    // if the lab manager is running, mark the lab as configured
    const labManagerHealthCheck = await this.labManagerService.healthCheck(labInstance.getLabManagerApiInfo().apiUrl);
    if (labManagerHealthCheck) {
      return await this.labInstancesService.markInstanceAsServerConfigured(labInstanceId);
    }

    // otherwise the server is started but not configured
    return await this.labInstancesService.markInstanceAsServerRunning(labInstanceId);
  }

  /////////////////////////////////////// EXTERNAL LAB SERVICE //////////////////////////////////

  async login(id: string): Promise<CnLabInstanceToken> {
    let labInstance: CnLabInstance = await this.getAndCheckAuthorizationToFindById(id);

    if (labInstance.isDesktop()) {
      throw new BlBadRequestException(CnErrorText.CANT_MANAGE_DESKTOP_LAB);
    }

    // check that the lab is running
    if (!labInstance.isRunning()) {
      // if not, try to refresh the status
      await this.refreshLabStatus(labInstance.id);
      labInstance = await this.getAndCheckAuthorizationToFindById(id);
      if (!labInstance.isRunning()) {
        throw new BlBadRequestException(CnErrorText.LAB_STOPPED);
      }
    }

    const user = CnCurrentUserHelper.getAndCheckCurrentUser();
    try {
      const token =
        await this.externalLabUserService.generateTempAccess(labInstance.getGlabSpaceApiInfo(),
          user, labInstance.space);

      return new CnLabInstanceToken(labInstance, token.temp_token);
    } catch (e: any) {
      const error = e as BlExternalApiError;

      // we try to add the user to the lab and reconnect
      const instanceToken = await this.addUserAndConnect(labInstance, CnCurrentUserHelper.getAndCheckCurrentUser());
      if (instanceToken) {
        return instanceToken;
      }

      switch (error.knownError?.code ?? null) {
        case 'gws_core.WRONG_CREDENTIALS_USER_NOT_ACTIVATED' :
          throw new BlUnauthorizedException(CnErrorText.LAB_USER_NOT_ACTIVATED);
        case 'gws_core.WRONG_CREDENTIALS_USER_NOT_FOUND' :
        case 'gws_core.OBJECT_ID_NOT_FOUND' :
          throw new BlUnauthorizedException(CnErrorText.LAB_USER_NOT_FOUND);
      }
      this.logger.error(e);
      throw new BlBadRequestException(CnErrorText.LAB_AUTH_ERROR);
    }
  }


  /**
   * Use on login if failed. We try to add the user if he is listed in the lab user and reconnect
   * @param labInstance
   * @param user
   * @private
   */
  private async addUserAndConnect(labInstance: CnLabInstance, user: CnUser): Promise<CnLabInstanceToken | null> {
    // Check if the user is listed in the lab user
    const group = await this.labInstanceUserService.findByLabInstanceIdAndUserId(labInstance.id,
      user.id);
    if (!group) return null;

    try {
      const externalRole: CnExternalLabUserRole = group.role === CnLabInstanceUserRole.OWNER ? 'ADMIN' : 'USER';
      await this.externalLabUserService.addUser(labInstance.getGlabSpaceApiInfo(), user, externalRole);

      const token =
        await this.externalLabUserService.generateTempAccess(labInstance.getGlabSpaceApiInfo(),
          CnCurrentUserHelper.getAndCheckCurrentUser(), labInstance.space);

      return new CnLabInstanceToken(labInstance, token.temp_token);
      // eslint-disable-next-line no-empty
    } catch (e: any) {
      return null;
    }
  }


  public async checkLabManagerStatus(labInstanceId: string): Promise<any> {
    const lab: CnLabInstance = await this.getAndCheckAuthorizationToFindById(labInstanceId);

    if (lab.isDesktop()) {
      throw new BlBadRequestException(CnErrorText.CANT_MANAGE_DESKTOP_LAB);
    }

    const isRunning = await this.externalLabApiService.healthCheck(lab.getGlabSpaceApiInfo());
    this.logger.log('Lab ' + labInstanceId + ' is running : ' + isRunning);
    if (!isRunning) {
      throw new BlBadRequestException('The lab is not running');
    }

    try {
      return await this.externalLabApiService.getSettings(lab.getGlabSpaceApiInfo());
    } catch {
      throw new BlBadRequestException('Can\'t retrieve the settings');
    }
  }

  /////////////////////////////////////// GROUPS //////////////////////////////////

  public async addUserToLab(labInstanceId: string, userId: string, role: CnLabInstanceUserRole): Promise<CnLabInstanceUser> {
    const labInstance = await this.getAndCheckAuthorizationToManageLab(labInstanceId, false);
    const user = await this.usersService.findByIdAndCheck(userId);


    return await this.dataSource.transaction(async entityManager => {
      // create the relation between the group and the lab
      // use group if we share team latter
      const labInstanceGroup = await this.labInstanceUserService.createLabInstanceUser(labInstance, user, role, entityManager);

      if (labInstance.isHttpAccessible()) {
        // add the user to the lab is the lab is running
        const labIsRunning = await this.externalLabApiService.healthCheck(labInstance.getGlabSpaceApiInfo());
        if (labIsRunning) {
          const externalRole: CnExternalLabUserRole = role === CnLabInstanceUserRole.OWNER ? 'ADMIN' : 'USER';
          await this.externalLabUserService.addUser(labInstance.getGlabSpaceApiInfo(), user, externalRole);
        }
      }

      return labInstanceGroup;
    });
  }

  public async updateUserLabRole(labInstanceId: string, groupId: string, role: CnLabInstanceUserRole): Promise<CnLabInstanceUser> {
    await this.getAndCheckAuthorizationToManageLab(labInstanceId, false);

    return this.labInstanceUserService.updateLabInstanceUserRole(labInstanceId, groupId, role);
  }

  public async removeUserFromLab(labInstanceId: string, userId: string): Promise<void> {
    const labInstance = await this.getAndCheckAuthorizationToManageLab(labInstanceId, false);

    return await this.dataSource.transaction(async entityManager => {
      await this.labInstanceUserService.deleteLabInstanceUser(labInstanceId, userId, entityManager);

      if (labInstance.isHttpAccessible()) {
        // add the user to the lab is the lab is running
        const labIsRunning = await this.externalLabApiService.healthCheck(labInstance.getGlabSpaceApiInfo());

        if (labIsRunning) {
          // deactivate the user in the lab
          await this.externalLabUserService.deactivateUser(labInstance.getGlabSpaceApiInfo(), userId);
        }
      }
    });
  }

  /**
   * Return the list of shared group for tha root project
   */
  public async getLabInstanceSharedUsers(labInstanceId: string): Promise<CnLabInstanceUser[]> {
    const labInstance = await this.getAndCheckAuthorizationToFindById(labInstanceId);

    return this.labInstanceUserService.findByLabInstanceId(labInstance.id);
  }

  //////////////////////////// PROJECT ////////////////////////////////

  public async addProjectInLab(labInstanceId: string, projectId: string): Promise<CnLabInstanceProject> {
    // get and check if the user can manage the lab
    const labInstance = await this.getAndCheckAuthorizationToManageLab(labInstanceId, false);

    return this.addRootProjectInLabInsecure(labInstance, projectId);
  }

  public async addRootProjectInLabInsecure(labInstance: CnLabInstance, projectId: string): Promise<CnLabInstanceProject> {
    // get and check if the user can see the project
    const projectTree = await this.projectAggregateService.getProjectTree(projectId);

    return await this.dataSource.transaction(async entityManager => {
      const labProject = await this.labInstanceProjectService.createLabInstanceProject(labInstance, projectTree, entityManager);
      await this.syncProjectInLab(labInstance, projectTree);

      return labProject;
    });
  }

  public async forceProjectSyncInLab(labInstanceId: string, projectId: string): Promise<void> {
    const labProject = await this.labInstanceProjectService.findByProjectId(projectId);
    if (labProject == null) throw new BlUnauthorizedException();

    const labManager = await this.getAndCheckAuthorizationToFindById(labInstanceId);

    const projectTree = await this.projectAggregateService.getProjectTree(projectId);
    await this.syncProjectInLab(labManager, projectTree);
  }

  public async syncProjectInLab(labInstance: CnLabInstance, projectTree: CnProject): Promise<void> {
    // add the user to the lab is the lab is running
    const labIsRunning = await this.externalLabApiService.healthCheck(labInstance.getGlabSpaceApiInfo());
    if (labIsRunning) {
      // add the project to the lab
      await this.externalLabProjectService.addProjectInLab(labInstance.getGlabSpaceApiInfo(), projectTree);
    }
  }

  public async removeProjectInLab(labInstanceId: string, projectId: string): Promise<void> {
    // get and check if the user can manage the lab
    const labInstance = await this.getAndCheckAuthorizationToManageLab(labInstanceId);

    return await this.dataSource.transaction(async entityManager => {
      await this.labInstanceProjectService.deleteLabInstanceProject(labInstanceId, projectId, entityManager);

      // remove the project from the lab
      await this.externalLabProjectService.deleteProjectInLab(labInstance.getGlabSpaceApiInfo(), projectId);
    });
  }


  public async getLabInstanceProjects(labInstanceId: string): Promise<CnLabInstanceProject[]> {
    // get and check if the user can manage the lab
    await this.getAndCheckAuthorizationToFindById(labInstanceId);

    return this.labInstanceProjectService.findByLabInstanceId(labInstanceId);
  }

  //////////////////////////// LAB MANAGER ////////////////////////////////

  public async getLabManagerStatus(labId: string): Promise<any> {
    const labInstance: CnLabInstance = await this.getAndCheckAuthorizationToManageLab(labId);
    return this.labManagerService.getLabStatus(labInstance);
  }

  public async listContainers(labId: string): Promise<CnLabManagerDockerPs[]> {
    const labInstance: CnLabInstance = await this.getAndCheckAuthorizationToManageLab(labId);
    return this.labManagerService.listContainers(labInstance);
  }

  public async getContainerDetails(labId: string, containerName: string): Promise<CnLabManagerDockerPsFull> {
    const labInstance: CnLabInstance = await this.getAndCheckAuthorizationToManageLab(labId);
    return this.labManagerService.getContainerDetails(labInstance, containerName);
  }

  public async getLogs(labId: string, containerName: string): Promise<string> {
    const labInstance: CnLabInstance = await this.getAndCheckAuthorizationToManageLab(labId);
    return this.labManagerService.getLogs(labInstance, containerName);
  }

  public async initAll(labId: string): Promise<void> {
    const labInstance: CnLabInstance = await this.getAndCheckServerStatusBeforeAction(labId);
    this.checkServerIsRunning(labInstance);
    await this.labManagerService.initAll(labInstance, labInstance.space.domain);
    await this.refreshLabStatus(labInstance.id);
  }

  public async upContainers(labId: string, options?: CnLabManagerComposeUpOptions): Promise<void> {
    const labInstance: CnLabInstance = await this.getAndCheckServerStatusBeforeAction(labId);
    this.checkServerIsRunning(labInstance);
    await this.labManagerService.upContainers(labInstance, options);
    await this.refreshLabStatus(labInstance.id);
  }

  public async restartContainers(labId: string, options?: CnManagerLabComposeRestartOptions): Promise<void> {
    const labInstance: CnLabInstance = await this.getAndCheckServerStatusBeforeAction(labId);
    this.checkServerIsRunning(labInstance);
    await this.labManagerService.restartContainers(labInstance, options);
    await this.refreshLabStatus(labInstance.id);
  }

  public async downContainers(labId: string): Promise<void> {
    const labInstance: CnLabInstance = await this.getAndCheckServerStatusBeforeAction(labId);
    this.checkServerIsRunning(labInstance);
    await this.labManagerService.downContainers(labInstance);
    await this.refreshLabStatus(labInstance.id);
  }

  public async pullContainers(labId: string): Promise<void> {
    const labInstance: CnLabInstance = await this.getAndCheckAuthorizationToManageLab(labId);
    this.checkServerIsRunning(labInstance);
    return this.labManagerService.pullContainers(labInstance);
  }

  public async pullBiota(labId: string, options: CnManagerLabPullBiotaOptions): Promise<void> {
    const labInstance: CnLabInstance = await this.getAndCheckAuthorizationToManageLab(labId);
    this.checkServerIsRunning(labInstance);
    return this.labManagerService.pullBiota(labInstance, options);
  }

  public async registryLogin(labId: string): Promise<void> {
    const labInstance: CnLabInstance = await this.getAndCheckAuthorizationToManageLab(labId);
    this.checkServerIsRunning(labInstance);
    return this.labManagerService.registryLogin(labInstance);
  }

  public async stopCurrentTask(labId: string): Promise<void> {
    const labInstance: CnLabInstance = await this.getAndCheckAuthorizationToManageLab(labId);
    this.checkServerIsRunning(labInstance);
    return this.labManagerService.stopCurrentTask(labInstance);
  }

  public async systemPrune(labId: string): Promise<void> {
    const labInstance: CnLabInstance = await this.getAndCheckAuthorizationToManageLab(labId);
    this.checkServerIsRunning(labInstance);
    return this.labManagerService.systemPrune(labInstance);
  }

  public async getLabManagerConfig(labId: string): Promise<CnLabInstanceConfigDTO> {
    const labInstance: CnLabInstance = await this.getAndCheckAuthorizationToManageLab(labId);
    return this.labManagerService.getConfig(labInstance);
  }

  public async startAdminer(labId: string): Promise<boolean> {
    const labInstance: CnLabInstance = await this.getAndCheckAuthorizationToManageLab(labId);
    this.checkServerIsRunning(labInstance);
    return this.labManagerService.startAdminer(labInstance);
  }

  public async stopAdminer(labId: string): Promise<boolean> {
    const labInstance: CnLabInstance = await this.getAndCheckAuthorizationToManageLab(labId);
    this.checkServerIsRunning(labInstance);
    return this.labManagerService.stopAdminer(labInstance);
  }

  public getLabManagerRecommendedVersion(): string {
    return this.labManagerService.getLabManagerRecommendedVersion();
  }

  /////////////////////////// BACKUP ////////////////////////////////

  public async createProdBackup(labId: string): Promise<CnLabBackupHistory[]> {
    const labInstance: CnLabInstance = await this.getAndCheckAuthorizationToManageLab(labId);

    return this.backupService.createProdBackup(labInstance);
  }

  public async stopCurrentBackup(labId: string): Promise<CnLabBackupHistory[]> {
    const labInstance: CnLabInstance = await this.getAndCheckAuthorizationToManageLab(labId);
    return this.backupService.stopCurrentBackup(labInstance);
  }

  public async syncBackupHistory(labId: string): Promise<void> {
    const labInstance: CnLabInstance = await this.getAndCheckAuthorizationToFindById(labId);
    return this.backupService.syncBackupHistory(labInstance);
  }

  public async getBackupsStatus(labInstanceId: string): Promise<CnLabBackupStatusDTO[]> {
    const labInstance = await this.getAndCheckAuthorizationToFindById(labInstanceId);
    return this.backupService.getBackupsStatus(labInstance);
  }

  public async getLabBackupHistory(labInstanceId: string, page: number, size: number): Promise<ClPageI<CnLabBackupHistory>> {
    await this.getAndCheckAuthorizationToFindById(labInstanceId);
    return this.backupService.getBackupHistory(labInstanceId, page, size);
  }

  public async getBackupStatusAdmin(labInstanceId: string): Promise<any> {
    const labInstance = await this.getAndCheckAuthorizationToFindById(labInstanceId);
    // for now this route is only for admin
    if (!CnCurrentUserHelper.isAdmin()) {
      throw new BlUnauthorizedException();
    }
    return this.backupService.checkBackupsSize(labInstance);
  }

  public async deleteLabBackups(labInstanceId: string): Promise<void> {
    const labInstance = await this.getAndCheckAuthorizationToManageLab(labInstanceId);

    if (labInstance.currentStatus.status !== CnLabInstanceStatus.NO_SERVER) {
      throw new BlBadRequestException('The backup can\'t be deleted as long as the ' +
        'server for the lab exists. Please delete the lab server first.');
    }

    return this.backupService.deleteLabAllBackups(labInstance);
  }

  /////////////////////////// EXTERNAL LAB //////////////////////////////
  public async registerLabConfig(labStart: CnLabInstanceStartDTO): Promise<void> {
    const labConfig = await this.labConfigService.getOrCreateLabConfig(labStart.lab_config);

    let labInstance = CnCurrentUserHelper.getAndCheckCurrentLabInstance();

    labInstance = await this.labInstancesService.markInstanceAsLabRunning(labInstance.id);
    await this.updateLabInstanceConfig(labInstance, labConfig);
  }

  public async getCurrentLabInstanceProjects(): Promise<CnProject[]> {
    const labProjects = await this.labInstanceProjectService.findByLabInstanceId(CnCurrentUserHelper.getAndCheckCurrentLabInstance().id);
    const projects = labProjects.map(labProject => labProject.project);
    return this.projectAggregateService.getProjectTrees(projects);
  }

  public async getCurrentLabInstanceSharedUsers(): Promise<CnExternalLabUser[]> {
    const labUsers = await this.labInstanceUserService.findByLabInstanceId(CnCurrentUserHelper.getAndCheckCurrentLabInstance().id);
    return labUsers.map(labUsers => {
      const externalRole: CnExternalLabUserRole = labUsers.role === CnLabInstanceUserRole.OWNER ? 'ADMIN' : 'USER';
      return {
        id: labUsers.user.id,
        first_name: labUsers.user.firstname,
        last_name: labUsers.user.lastname,
        email: labUsers.user.email,
        group: externalRole,
        is_active: true,
        theme: labUsers.user.theme,
        lang: labUsers.user.lang,
        photo: labUsers.user.photo,
      };
    });
  }

  public async checkUserCredentials(credentials: BlCredentials, ignoreCaptcha: boolean,
                                    ignore2Fa: boolean): Promise<CnExternalCheckCredentialResponse> {
    // check that the user has access to the lab
    const lab = await this.getAndCheckAuthorizationToFindById(CnCurrentUserHelper.getAndCheckCurrentLabInstance().id);

    // check the credentials, if the lab is cloud, it needs a valid captcha
    // only check the captcha for constellab standard domain (because this is the only domain defined in google
    return this.authService.externalCheckCredentials(credentials, lab.isConstellabDomain() && !ignoreCaptcha, ignore2Fa);
  }

  /////////////////////////// EXTERNAL LAB MANAGER //////////////////////////////
  public async getCurrentLabInstanceBackupInfo(): Promise<CnExternalLabBackupInfoDTO> {
    const labInstance = CnCurrentUserHelper.getAndCheckCurrentLabInstance();
    return this.backupService.getBackupInfo(labInstance);
  }

  public async saveCurrentLabBackupHistory(backups: CnLabBackupBucket[]): Promise<CnLabBackupHistory[]> {
    return this.backupService.saveBackupHistory(CnCurrentUserHelper.getAndCheckCurrentLabInstance(), backups);
  }


  /////////////////////////// SERVER //////////////////////////////

  public async getServerCompleteInfo(labInstanceId: string): Promise<CnCpCompleteInfo> {
    const labInstance = await this.getAndCheckAuthorizationToManageLab(labInstanceId);
    return this.labServerService.getCompleteInfo(labInstance);
  }

  public async initServer(labInstanceId: string): Promise<CnLabInstanceStatusDTO> {
    let labInstance = await this.getAndCheckServerStatusBeforeAction(labInstanceId, true);

    labInstance = await this.labInstancesService.markInstanceAsServerStarting(labInstance.id);

    // call the init async (return the server response immediately)
    this.initServerAsync(labInstance).catch(
      // if an error occurred we just refresh the lab status
      (error: Error) => this.onError(labInstance.id, `Error during server initialization : ${error.message}`, error)
    );

    return this.getStatus(labInstance);
  }

  private async initServerAsync(labInstance: CnLabInstance): Promise<void> {

    labInstance = await this.createServerAsync(labInstance, false);

    // wait for the DNS to be ready
    // wait for 2 consecutive success because DNS propagation can take some time
    const labSshService = await this.cloudProviderFactory.getSshLabService(labInstance);
    await labSshService.waitForSshConnection(3);

    await this.configureServerAsync(labInstance, false);

    await this.refreshStatusAndServerText(labInstance.id);
  }

  public async createServer(labInstanceId: string): Promise<CnLabInstanceStatusDTO> {
    let labInstance = await this.getAndCheckServerStatusBeforeAction(labInstanceId, true);

    labInstance = await this.labInstancesService.markInstanceAsServerStarting(labInstance.id);

    // call the init async (return the server response immediately)
    this.createServerAsync(labInstance, true).catch(
      // if an error occurred we just refresh the lab status
      (error: Error) => this.onError(labInstance.id, `Error during server creation: ${error.message}`, error)
    );

    return this.getStatus(labInstance);
  }

  private async createServerAsync(labInstance: CnLabInstance, refreshStatus: boolean): Promise<CnLabInstance> {
    labInstance = await this.labServerService.initInstance(labInstance);

    if (refreshStatus) {
      labInstance = await this.refreshStatusAndServerText(labInstance.id);
    }


    return labInstance;
  }

  public async configureServer(labInstanceId: string): Promise<CnLabInstanceStatusDTO> {
    let labInstance = await this.getAndCheckServerStatusBeforeAction(labInstanceId);

    const labSshService = await this.cloudProviderFactory.getSshLabService(labInstance);
    const sshTest = await labSshService.checkSshConnection();
    if (!sshTest) {
      throw new BlBadRequestException(`SSH connection to ${labInstance.virtualHost} failed`);
    }

    labInstance = await this.labInstancesService.markInstanceAsServerStarting(labInstance.id);

    // call the init async (return the server response immediately)
    this.configureServerAsync(labInstance, true).catch(
      // if an error occurred we just refresh the lab status
      (error: Error) => this.onError(labInstance.id, `Error during server configuration: ${error.message}`, error)
    );

    return this.getStatus(labInstance);
  }

  public async configureServerAsync(labInstance: CnLabInstance, refreshStatus: boolean): Promise<CnLabInstance> {
    labInstance = await this.labConfigurerService.configureServer(labInstance);

    if (refreshStatus) {
      labInstance = await this.refreshStatusAndServerText(labInstance.id);
    }
    return labInstance;
  }

  private async refreshStatusAndServerText(labInstanceId: string): Promise<CnLabInstance> {
    const status = await this.checkAndRefreshStatus(labInstanceId);
    let text: string;

    if (!status.hasServerInstanceId || !status.hasServerVolumeId) {
      text = 'Server not yet created';
    } else if (!status.labManagerIsRunning) {
      text = 'Server up and ready to be configured';
    } else if (!status.labIsRunning) {
      text = 'Lab manager up and lab ready to be configured';
    } else {
      text = 'Lab running';
    }

    return this.labInstancesService.updateServerTask(labInstanceId, text, CnLabInstanceServerTaskStatus.SUCCESS);
  }

  private async onError(labInstanceId: string, message: string, error: Error): Promise<void> {
    this.logger.error(message);
    await this.labInstancesService.updateServerTask(labInstanceId, message, CnLabInstanceServerTaskStatus.ERROR)
      .catch(err => this.logger.error(err));
    this.refreshLabStatus(labInstanceId).catch(err => this.logger.error(err));

    // log stack trace of error
    if (error.stack) {
      this.logger.error(error.stack);
    }
  }

  public async deleteServerInstance(labInstanceId: string): Promise<void> {
    const labInstance = await this.getAndCheckServerStatusBeforeAction(labInstanceId, true);

    this.security.checkAuthorizationToDeleteServer(CnCurrentUserHelper.getAndCheckUserSpaceInfo());
    await this.labServerService.deleteLabInstanceServerAndVolume(labInstance);

    await this.refreshLabStatus(labInstanceId);
  }

  async startInstance(id: string): Promise<CnLabInstance> {
    const labInstance = await this.getAndCheckServerStatusBeforeAction(id, true);

    if (labInstance.isFreeTrial) {
      const available = await this.freeTrialService.trialLabStillValid(labInstance.id);

      if (!available) {
        throw new BlBadRequestException(CnErrorText.FREE_TRIAL_LAB_EXPIRED);
      }
    }

    return await this.labServerService.startLab(labInstance);
  }


  async stopInstance(id: string): Promise<CnLabInstance> {
    const labInstance = await this.getAndCheckServerStatusBeforeAction(id, true);

    return this.labServerService.stopLab(labInstance);
  }

  async updateLabManager(labInstanceId: string, labManagerVersion: string): Promise<CnLabInstanceStatusDTO> {
    const labInstance = await this.getAndCheckServerStatusBeforeAction(labInstanceId);
    this.checkServerIsRunning(labInstance);

    await this.labConfigurerService.updateLabManager(labInstance, labManagerVersion);
    return this.getStatus(labInstance);
  }

  async updateDockerlab(labInstanceId: string): Promise<CnLabInstanceStatusDTO> {
    const labInstance = await this.getAndCheckServerStatusBeforeAction(labInstanceId);
    this.checkServerIsRunning(labInstance);


    await this.labConfigurerService.updateDockerlabRepo(labInstance);
    return this.getStatus(labInstance);
  }

  async stopCurrentServerTask(labInstanceId: string): Promise<CnLabInstanceStatusDTO> {
    let labInstance = await this.getAndCheckAuthorizationToManageLab(labInstanceId);

    if (labInstance.serverTaskStatus !== CnLabInstanceServerTaskStatus.RUNNING) {
      throw new BlBadRequestException('No task running');
    }

    labInstance = await this.labInstancesService.updateServerTask(labInstance.id,
      `Last task stopped manually: ${labInstance.serverTaskText}`, CnLabInstanceServerTaskStatus.ERROR);
    return this.getStatus(labInstance);
  }

  ////////////////////////// STATUS RULES  //////////////////////////////

  public async createGreenOption(labInstanceId: string, greenOption: CnLabGreenOptionFormDto): Promise<CnLabGreenOption> {
    const labInstance = await this.getAndCheckAuthorizationToManageLab(labInstanceId);
    return this.labGreenOptionService.createFromDTO(greenOption, labInstance);
  }

  public async updateGreenOption(greenOptionId: string, greenOption: CnLabGreenOptionFormDto): Promise<CnLabGreenOption> {
    const greenOptionDb = await this.labGreenOptionService.findByIdAndCheck(greenOptionId);
    await this.getAndCheckAuthorizationToManageLab(greenOptionDb.labInstanceId);
    return this.labGreenOptionService.updateFromDTO(greenOptionId, greenOption);
  }

  public async deleteGreenOption(id: string): Promise<void> {
    const greenOption = await this.labGreenOptionService.findByIdAndCheck(id);
    await this.getAndCheckAuthorizationToManageLab(greenOption.labInstanceId);
    await this.labGreenOptionService.deleteById(id);
  }

  public async getGreenOptions(labInstanceId: string): Promise<CnLabGreenOption[]> {
    await this.getAndCheckAuthorizationToManageLab(labInstanceId);
    return this.labGreenOptionService.findRulesByLabInstanceId(labInstanceId);
  }

  ////////////////////////// KPI //////////////////////////////

  public async getLabInstanceRunningKpis(labInstanceId: string, request: CnLabInstanceStatusRunRequest):
    Promise<CnLabInstanceStatusRunResponse> {
    const labInstance = await this.getAndCheckAuthorizationToFindById(labInstanceId);

    let serverPrices: CnServerPrices;

    if (labInstance.isCloud() && labInstance.billingMode === CnLabInstanceBillingMode.HOURLY) {
      const labServerStandard = await this.labInstancesService.getLabServerStandard(labInstance.id);
      serverPrices = await this.serverPriceService.getServerAllPrices(labServerStandard.id, 'ASC');
    }
    return this.labStatusService.getLabInstanceRunningKpisWithBilling(labInstance.id, request, serverPrices);
  }

  ////////////////////////// DESKTOP //////////////////////////////
  public async generateDesktopConfig(labInstanceId: string,
                                     desktopConfig: CnLabInstanceDesktopConfig): Promise<CnLabDesktopConfig> {
    const lab = await this.getAndCheckAuthorizationToFindById(labInstanceId);

    if (!lab.isDesktop()) {
      throw new BlBadRequestException('Lab is not desktop');
    }

    return this.labInstanceDesktopService.generateDesktopConfig(lab, desktopConfig);
  }


  //////////////////////////// AUTHORIZATION ////////////////////////////////
  private async getAndCheckAuthorizationToFindById(id: string): Promise<CnLabInstance> {
    const labInstance = await this.labInstancesService.findByIdAndCheck(id, {space: true});
    await this.security.checkAuthorizationToFindById(labInstance, CnCurrentUserHelper.getAndCheckUserSpaceInfo());
    return labInstance;
  }


  private async getAndCheckAuthorizationToUpdateAdmin(id: string): Promise<CnLabInstance> {
    const labInstance = await this.labInstancesService.findByIdAndCheck(id, {sharedGroups: true, space: true});
    this.security.checkAuthorizationToUpdateAdmin(labInstance, CnCurrentUserHelper.getAndCheckUserSpaceInfo());
    return labInstance;
  }

  private async getAndCheckAuthorizationToManageLab(id: string, refuseDesktop: boolean = true): Promise<CnLabInstance> {
    const labInstance = await this.labInstancesService.findByIdAndCheck(id, {sharedGroups: true, space: true});

    if (refuseDesktop && labInstance.isDesktop()) {
      throw new BlBadRequestException(CnErrorText.CANT_MANAGE_DESKTOP_LAB);
    }
    await this.security.checkAuthorizationToManageLab(labInstance, CnCurrentUserHelper.getAndCheckUserSpaceInfo());
    return labInstance;
  }

  /**
   * Check if the user can manage the lab and stop it temporary.
   * It refreshes the lab status and check if the server is not busy
   * It checks if no experiment or task on the lab is running
   * @private
   */
  private async getAndCheckServerStatusBeforeAction(id: string, requiresCloudLab: boolean = false): Promise<CnLabInstance> {
    await this.refreshLabStatus(id);

    const labInstance = await this.getAndCheckAuthorizationToManageLab(id, true);

    if (requiresCloudLab && !labInstance.isCloud()) {
      throw new BlBadRequestException('This action is only available for cloud lab');
    }

    if (labInstance.serverIsBusy()) {
      throw new BlBadRequestException(`Server is ${labInstance.currentStatus.status} and cannot configured`);
    }

    if (labInstance.serverTaskIsRunning()) {
      throw new BlBadRequestException(`The task '${labInstance.serverTaskText}' is running on the lab, it can't be configured`);
    }

    // if the lab is not running, no need to check if an experiment is running
    if (!labInstance.isRunning()) return labInstance;

    await this.labServerService.checkLabActivity(labInstance);

    return labInstance;
  }

  private checkServerIsRunning(labInstance: CnLabInstance): void {
    if (labInstance.serverIsStopped()) {
      throw new BlBadRequestException('Server is stopped, please start the server first');
    }
  }

}
