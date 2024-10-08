import { Injectable, Logger } from '@nestjs/common';
import {
  CnLab,
  CnLabBillingMode,
  CnLabDomain,
  CnLabEntity,
  CnLabFull,
  CnLabType,
  CnLabVolumeType,
  CnLabWithSpace
} from './cn-lab.entity';
import { CnLabsService } from './cn-labs.service';
import { CnLabStatusHistory } from './status/cn-lab-status-history.entity';
import { CnErrorText } from '../cn-core/model/config/cn-error-text.class';
import { CnExternalLabUser, CnExternalLabUserRole } from '../cn-external-lab-api/model/cn-external-lab-api.class';
import { ClPage, ClPageI, ClStringHelper } from '@monorepo/core-lib';
import { CnCurrentUserHelper } from '../cn-core/utils/cn-current-user.helper';
import {
  CnLabManagerBackupInfoDTO,
  CnLabManagerComposeUpOptions,
  CnLabManagerDockerPs,
  CnLabManagerDockerPsFull,
  CnLabManagerRestoreBackupConfigDTO,
  CnManagerLabComposeRestartOptions,
  CnManagerLabPullBiotaOptions
} from '../cn-external-lab-api/model/cn-lab-manager.class';
import { CnLabManagerService } from './cn-lab-manager.service';
import { CnLabToken } from './user/cn-lab-token.class';
import {
  CnLabCloudCreateDTO,
  CnLabCodelabDTO,
  CnLabConfigDTO,
  CnLabCreateAdminDTO,
  CnLabCreateDesktopDTO,
  CnLabDesktopConfig,
  CnLabFindOneDto,
  CnLabGlabApiInfo,
  CnLabServerInfoDTO,
  CnLabStartDTO,
  CnLabStatusDTO,
  CnLabUpdateAdminDTO,
  CnRequestLab
} from './cn-lab.dto';
import { CnLabConfig } from '../cn-lab-configs/cn-lab-config.entity';
import { CnLabsSecurity } from './cn-labs.security';
import {
  BlBadRequestException,
  BlCredentials,
  BlDtoHelper,
  BlExternalApiError,
  BlSearchParams,
  BlUnauthorizedException
} from '@monorepo/back-core-lib';
import { CnLabUser, CnLabUserRole } from './user/cn-lab-user.entity';
import { CnExternalLabUserService } from '../cn-external-lab-api/cn-external-lab-user.service';
import { CnExternalLabApiService } from '../cn-external-lab-api/cn-external-lab-api.service';
import { CnLabUserService } from './user/cn-lab-user.service';
import { DataSource, EntityManager } from 'typeorm';
import { CnUsersService } from '../cn-users/cn-users.service';
import { CnCpCompleteInfo } from './server/cn-cloud-provider.class';
import { CnLabServerService } from './server/cn-lab-server.service';
import { CnLabConfigurerService } from './server/cn-lab-configurer.service';
import { CnUser } from '../cn-users/cn-user.entity';
import { CnLabConfigsService } from '../cn-lab-configs/cn-lab-configs.service';
import { CnLabDesktopService, CnLabDesktopZipConfig } from './desktop/cn-lab-desktop.service';
import { CnBrickGWS } from '../cn-bricks/cn-brick.dto';
import { CnLabMailService } from './mail/cn-lab-mail.service';
import { CnLabGreenOption } from './green-option/cn-lab-green-option.entity';
import { CnLabGreenOptionService } from './green-option/cn-lab-green-option.service';
import { CnLabGreenOptionFormDto } from './green-option/cn-lab-green-option.dto';
import { CnAuthService, CnExternalCheckCredentialResponse } from '../cn-auth/cn-auth.service';
import { CnLabServerTaskStatus, CnLabStatus } from './status/cn-lab-status.enum';
import { CnLabStatusService } from './status/cn-lab-status.service';
import { CnLabStatusRunRequest, CnLabStatusRunResponse } from './status/cn-lab-status.dto';
import { CnLabFreeService } from './lab-free/cn-lab-free.service';
import { CnLabBackupsHistory, CnLabBackupStatusDTO } from './backup/cn-lab-backup.dto';
import { CnLabBucketHistory } from './backup/cn-lab-backup-history.entity';
import { CnCloudProviderRegion } from '../cn-cloud-providers/cn-cloud-provider-regions/cn-cloud-provider-region.entity';
import { CnCloudProviderFactory } from './server/cn-cloud-provider.factory';
import { CnServerPriceService } from '../cn-servers-info/server-price/cn-server-price.service';
import { CnServerPrices } from '../cn-servers-info/server-price/cn-server-price.dto';
import { CnLabConfigDto } from '../cn-lab-configs/cn-lab-config.dto';
import { CnLabBackupAggregateService } from './backup/cn-lab-backup-aggregate.service';


@Injectable()
export class CnLabAggregateService {

  private readonly logger = new Logger(CnLabAggregateService.name);


  constructor(private labsService: CnLabsService,
              private labUserService: CnLabUserService,
              private labStatusService: CnLabStatusService,
              private labManagerService: CnLabManagerService,
              private security: CnLabsSecurity,
              private usersService: CnUsersService,
              private externalLabUserService: CnExternalLabUserService,
              private externalLabApiService: CnExternalLabApiService,
              private dataSource: DataSource,
              private labServerService: CnLabServerService,
              private labConfigurerService: CnLabConfigurerService,
              private cloudProviderFactory: CnCloudProviderFactory,
              private labConfigService: CnLabConfigsService,
              private labDesktopService: CnLabDesktopService,
              private labMailService: CnLabMailService,
              private labGreenOptionService: CnLabGreenOptionService,
              private authService: CnAuthService,
              private labFreeService: CnLabFreeService,
              private backupService: CnLabBackupAggregateService,
              private serverPriceService: CnServerPriceService) {
  }

  /**
   * Create a lab with all information (only for admin)
   */
  async createAdmin(createLab: CnLabCreateAdminDTO): Promise<CnLabEntity> {
    const lab = BlDtoHelper.fromDto(CnLabEntity, createLab);

    const userInfo = CnCurrentUserHelper.getAndCheckUserSpaceInfo();
    this.security.checkAuthorizationToCreateAdmin(lab, userInfo);

    return this.dataSource.transaction(async entityManager => {
      return this.createLabNotSecure(lab, createLab.dailyBackupRegion, createLab.weeklyBackupRegion, entityManager);
    });
  }

  /**
   * Route accessible by users to create a cloud lab
   * @param cloudCreateDTO
   */
  public async createCloudLab(cloudCreateDTO: CnLabCloudCreateDTO): Promise<CnLabEntity> {
    const lab = new CnLabEntity();
    lab.name = cloudCreateDTO.name;
    lab.type = CnLabType.CLOUD;
    lab.serverCloud = cloudCreateDTO.serverCloud;
    lab.region = cloudCreateDTO.region;
    lab.billingMode = CnLabBillingMode.HOURLY;
    lab.volumeSize = cloudCreateDTO.volumeSize;
    lab.volumeType = CnLabVolumeType.HIGH_SPEED;
    lab.isFreeLab = false;
    lab.space = CnCurrentUserHelper.getCurrentSpace();
    lab.virtualHost = ClStringHelper.generateUUID() + '.' + CnLabDomain.CONSTELLAB_APP;

    // handle lab config
    const configDto: CnLabConfigDto = {
      version: 1,
      brick_versions: cloudCreateDTO.labConfig.brickVersions
    };
    lab.labConfig = await this.labConfigService.getOrCreateLabConfig(configDto);

    const labDb = await this.dataSource.transaction(async entityManager => {
      const labDb = await this.createLabNotSecure(lab, cloudCreateDTO.dailyBackupRegion,
        cloudCreateDTO.weeklyBackupRegion, entityManager);

      await this.labUserService.createLabUser(lab, CnCurrentUserHelper.getAndCheckCurrentUser(),
        CnLabUserRole.OWNER, entityManager);

      return labDb;
    });

    // init the server asynchronously
    await this.initServer(lab.id);

    return labDb;
  }

  public async createLabNotSecure(lab: CnLabEntity,
                                  dailyBackupRegion: CnCloudProviderRegion,
                                  weeklyBackupRegion: CnCloudProviderRegion,
                                  entityManager: EntityManager): Promise<CnLabEntity> {
    const labDb: CnLabEntity = await this.labsService.create(lab, entityManager);

    if (lab.isCloud() && !lab.isFreeLab) {
      if (dailyBackupRegion == null || weeklyBackupRegion == null) {
        throw new BlBadRequestException('Backup regions are required for a cloud lab');
      }

      await this.backupService.createBackupOptions(labDb,
        dailyBackupRegion, weeklyBackupRegion, entityManager);
    }

    return labDb;
  }

  /**
   * Update a lab with all information (only for admin)
   */
  async updateAdmin(updateLab: CnLabUpdateAdminDTO): Promise<CnLabWithSpace> {
    await this.getAndCheckAuthorizationToUpdateAdmin(updateLab.id);
    const lab = BlDtoHelper.fromDto(CnLabEntity, updateLab);

    return this.labsService.updateLab(lab);
  }

  /**
   * Accessible by any user to create his own desktop lab
   * @param createLab
   */
  async createDesktop(createLab: CnLabCreateDesktopDTO): Promise<CnLab> {
    const lab = new CnLabEntity();
    lab.name = createLab.name;
    lab.desktopPlatform = createLab.desktopPlatform;
    lab.type = CnLabType.DESKTOP;

    const userInfo = CnCurrentUserHelper.getAndCheckUserSpaceInfo();
    lab.setSpace(userInfo.space);

    this.security.checkAuthorizationCreateDesktopLab(lab);

    return this.dataSource.transaction(async entityManager => {
      const labDb = await this.labsService.create(lab, entityManager);

      // add the user as OWNER of his lab
      await this.labUserService.createLabUser(lab, userInfo.user, CnLabUserRole.OWNER, entityManager);
      return labDb;
    });
  }

  /**
   * Update accessible for any owner of the lab, he can update only few parameters
   */
  async updateDesktopLab(id: string, updateLab: CnLabCreateDesktopDTO): Promise<CnLab> {
    const labDb: CnLab = await this.labsService.findByIdAndCheck(id);

    if (!labDb.isDesktop()) {
      throw new BlUnauthorizedException();
    }
    await this.security.checkAuthorizationToManageLab(labDb, CnCurrentUserHelper.getAndCheckUserSpaceInfo());

    return this.labsService.updatePartial(id, {
      name: updateLab.name,
      desktopPlatform: updateLab.desktopPlatform
    });
  }

  async updateLabName(id: string, name: string): Promise<CnLab> {
    const labDb: CnLab = await this.labsService.findByIdAndCheck(id);
    await this.security.checkAuthorizationToManageLab(labDb, CnCurrentUserHelper.getAndCheckUserSpaceInfo());
    return this.labsService.updateLabName(id, name);
  }

  async delete(id: string): Promise<void> {
    const lab = await this.getAndCheckAuthorizationToUpdateAdmin(id);

    await this.dataSource.transaction(async entityManager => {
      await this.backupService.deleteBackupOptions(lab, entityManager);
      await this.labsService.deleteById(id, entityManager);
    });
  }

  async requestLab(request: CnRequestLab): Promise<void> {
    const userInfo = CnCurrentUserHelper.getAndCheckUserSpaceInfo();
    return this.labMailService.sendRequestLabMail(request, userInfo.user, userInfo.space);
  }


  async findByIdAndCheck(id: string): Promise<CnLabFindOneDto> {
    const lab = await this.labsService.findByIdAndCheck(id);
    const userRole = await this.security.checkAuthorizationToFindById(lab, CnCurrentUserHelper.getAndCheckUserSpaceInfo());
    return CnLabFindOneDto.create(lab, userRole);
  }

  async findCodelabInfo(id: string): Promise<CnLabCodelabDTO> {
    const lab = await this.labsService.findByIdAndCheck(id);
    await this.security.checkAuthorizationToFindById(lab, CnCurrentUserHelper.getAndCheckUserSpaceInfo());
    return {
      username: lab.getCodelabUsername(),
      token: lab.codelabToken,
      url: lab.getCodelabUrl()
    };
  }

  async getByCurrentSpace(page: number, size: number): Promise<ClPageI<CnLab>> {
    this.security.checkAuthorizationToFindAllBySpace(CnCurrentUserHelper.getAndCheckUserSpaceInfo());
    return this.labsService.findBySpace(CnCurrentUserHelper.getCurrentSpace().id, page, size);
  }

  getCurrentLabs(page: number, size: number): Promise<ClPageI<CnLab>> {
    // no security check because the get is filtered with user id
    return this.labsService.getCurrentLabs(page, size);
  }

  getCurrentRunningLabs(): Promise<CnLab[]> {
    // no security check because the get is filtered with user id
    return this.labsService.getCurrentRunningLabs();
  }

  async searchAll(searchParams: BlSearchParams, page: number, size: number): Promise<ClPage<CnLabFull>> {
    this.security.checkAuthorizationToFindAll(CnCurrentUserHelper.getAndCheckUserSpaceInfo());

    return this.labsService.searchAll(searchParams, page, size);
  }

  async searchInCurrentSpace(searchParams: BlSearchParams, page: number, size: number): Promise<ClPage<CnLabFull>> {
    this.security.checkAuthorizationToFindAllBySpace(CnCurrentUserHelper.getAndCheckUserSpaceInfo());

    return this.labsService.searchInSpace(CnCurrentUserHelper.getAndCheckUserSpaceInfo().spaceId,
      searchParams, page, size);
  }

  public async getConfig(id: string): Promise<CnLabConfig> {
    const lab = await this.getAndCheckAuthorizationToFindById(id);

    if (lab.labConfigId == null) {
      throw new BlBadRequestException(CnErrorText.LAB_CONFIG_NOT_FOUND);
    }

    return this.labConfigService.getCompleteConfig(lab.labConfigId);
  }

  public async getGlabConfig(lab: CnLab): Promise<CnLabGlabApiInfo> {
    const gwsCoreVerson = await this.labConfigService.getLabBrickVersion(lab.labConfigId, CnBrickGWS.GWS_CORE);
    return {
      gwsCoreVersion: gwsCoreVerson.version,
      apiInfo: lab.getGlabSpaceApiInfo()
    };
  }

  /**
   * Update the lab bricks config.
   * If the lab is desktop, the config is updated directly in the lab.
   * If the lab is on cloud, it only updates the lab manager config (the config is then update when the lab is restarted)
   * @param labId
   * @param config
   */
  public async updateConfig(labId: string, config: CnLabConfigDTO): Promise<void> {
    // check if the gws core is in the brick list
    const gwsCore = config.brickVersions.find(brickVersion => brickVersion.name.toLowerCase() === CnBrickGWS.GWS_CORE.toLowerCase());

    if (gwsCore == null) {
      throw new BlBadRequestException(`The brick '${CnBrickGWS.GWS_CORE}' must be set in the config`);
    }

    const lab = await this.getAndCheckAuthorizationToManageLab(labId, false);

    if (lab.isHttpAccessible()) {
      await this.labManagerService.updateConfig(lab, config);
    } else {
      // for on desktop, we need to update the lab config directly (there is no lab manager)
      const labConfig = await this.labConfigService.getOrCreateLabConfig({
        version: 1,
        brick_versions: config.brickVersions
      });

      await this.updateLabConfig(lab, labConfig);
    }
  }

  private async updateLabConfig(lab: CnLab, labConfig: CnLabConfig): Promise<CnLab> {
    return this.labsService.updateLabConfig(lab.id, labConfig);
  }

  public async getLabServerInfo(labId: string): Promise<CnLabServerInfoDTO> {
    const lab = await this.getAndCheckAuthorizationToFindById(labId);
    if (!lab.isCloud()) {
      throw new BlBadRequestException('The lab is not on a cloud server');
    }

    const fullLab = await this.labsService.findByIdAndCheck(labId,
      { serverCloud: true });

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

  public async findByIdAdmin(id: string): Promise<CnLabFull> {
    this.security.checkAuthorizationToFindByIdAdmin(CnCurrentUserHelper.getAndCheckUserSpaceInfo());
    return this.labsService.findByIdAndCheckFull(id);
  }

  /////////////////////////////////////// STATUS  //////////////////////////////////

  public async getLabStatus(id: string): Promise<CnLabStatusDTO> {
    const lab = await this.getAndCheckAuthorizationToFindById(id);
    return this.getStatus(lab);
  }

  private async getStatus(lab: CnLab): Promise<CnLabStatusDTO> {
    const promises: [Promise<boolean>, Promise<boolean>] = [
      this.labManagerService.healthCheck(lab.getLabManagerApiInfo().apiUrl),
      this.externalLabApiService.healthCheck(lab.getGlabSpaceApiInfo())
    ];

    return Promise.all(promises).then(async ([labManagerStatus, glabStatus]) => {
      // if the lab is marked as stopped but the glab is accessible for refresh status
      if (lab.isHttpAccessible() && glabStatus && lab.currentStatus.status === 'SERVER_STOPPED') {
        lab = await this.refreshLabStatus(lab.id);
      }

      const labStatus = new CnLabStatusDTO();
      labStatus.labStatus = lab.currentStatus.status;
      labStatus.labManagerIsRunning = labManagerStatus;
      labStatus.labIsRunning = glabStatus;
      labStatus.hasServerInstanceId = !!lab.serverInstanceId;
      labStatus.hasServerVolumeId = !!lab.serverVolumeId;
      labStatus.dnsConfigured = lab.dnsConfigured;
      labStatus.serverTaskText = lab.serverTaskText;
      labStatus.serverTaskStatus = lab.serverTaskStatus;
      labStatus.serverTaskDatetime = lab.serverTaskDatetime;
      return labStatus;
    });

  }

  public async getLabStatusHistory(labId: string, page: number, size: number,
                                   searchParams: BlSearchParams): Promise<ClPageI<CnLabStatusHistory>> {
    await this.getAndCheckAuthorizationToFindById(labId);
    return this.labStatusService.getStatusHistoryPaginated(page, size, labId, searchParams);
  }

  /**
   * Refresh the lab status based on server status
   * @param id
   */
  async checkAndRefreshStatus(id: string): Promise<CnLabStatusDTO> {
    let lab: CnLab = await this.getAndCheckAuthorizationToFindById(id);

    lab = await this.refreshLabStatus(lab.id);
    return this.getStatus(lab);
  }

  /**
   * Refresh the status of the lab based on the status of the server instance
   * @param labId
   */
  public async refreshLabStatus(labId: string): Promise<CnLab> {
    const lab = await this.labsService.findByIdAndCheck(labId);
    if (!lab.isHttpAccessible()) {
      throw new BlBadRequestException(`Cannot refresh status of a lab that is not on a server`);
    }

    if (lab.isCloud()) {
      if (!lab.serverInstanceId && !lab.serverTaskIsRunning()) {
        return await this.labsService.markInstanceAsNoServer(labId);
      }

      // manage all the server status, except running
      const serverStatus = await this.labServerService.getLabServerStatus(lab);
      if (serverStatus.status === 'CREATING' || serverStatus.status === 'RESTARTING') {
        return await this.labsService.markInstanceAsServerStarting(labId);
      }
      if (serverStatus.status === 'STOPPING') {
        return await this.labsService.markInstanceAsServerStopping(labId);
      }
      if (serverStatus.status === 'STOPPED') {
        return await this.labsService.markInstanceAsServerStopped(labId);
      }
      // Specific case to handle error, mark as stopped and set the error in the server task
      if (serverStatus.status === 'ERROR') {
        const text = serverStatus.message?.length > 0 ? serverStatus.message : 'No information about the error';
        return await this.labsService.markInstanceAsError(labId, text);
      }
    }

    // if there is a task running, the server is configuring
    // if (lab.serverTaskIsRunning()) {
    //   return await this.labsService.markInstanceAsServerConfiguring(labId);
    // }

    // if the lab is running
    const healthCheck = await this.externalLabApiService.healthCheck(lab.getGlabSpaceApiInfo());
    if (healthCheck) {
      return await this.labsService.markInstanceAsLabRunning(labId);
    }

    // if the lab manager is running, mark the lab as configured
    const labManagerHealthCheck = await this.labManagerService.healthCheck(lab.getLabManagerApiInfo().apiUrl);
    if (labManagerHealthCheck) {
      return await this.labsService.markInstanceAsServerConfigured(labId);
    }

    // otherwise the server is started but not configured
    return await this.labsService.markInstanceAsServerRunning(labId);
  }

  /////////////////////////////////////// EXTERNAL LAB SERVICE //////////////////////////////////

  async login(id: string): Promise<CnLabToken> {
    let lab: CnLabWithSpace = await this.getAndCheckAuthorizationToFindById(id);

    if (lab.isDesktop()) {
      throw new BlBadRequestException(CnErrorText.CANT_MANAGE_DESKTOP_LAB);
    }

    // check that the lab is running
    if (!lab.isRunning()) {
      // if not, try to refresh the status
      await this.refreshLabStatus(lab.id);
      lab = await this.getAndCheckAuthorizationToFindById(id);
      if (!lab.isRunning()) {
        throw new BlBadRequestException(CnErrorText.LAB_STOPPED);
      }
    }

    const user = CnCurrentUserHelper.getAndCheckCurrentUser();
    try {
      const token =
        await this.externalLabUserService.generateTempAccess(lab.getGlabSpaceApiInfo(),
          user, lab.space);

      return new CnLabToken(lab, token.temp_token);
    } catch (e: any) {
      const error = e as BlExternalApiError;

      // we try to add the user to the lab and reconnect
      const instanceToken = await this.addUserAndConnect(lab, CnCurrentUserHelper.getAndCheckCurrentUser());
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
   * @param lab
   * @param user
   * @private
   */
  private async addUserAndConnect(lab: CnLabWithSpace, user: CnUser): Promise<CnLabToken | null> {
    // Check if the user is listed in the lab user
    const group = await this.labUserService.findByLabIdAndUserId(lab.id,
      user.id);
    if (!group) return null;

    try {
      const externalRole: CnExternalLabUserRole = group.role === CnLabUserRole.OWNER ? 'ADMIN' : 'USER';
      await this.externalLabUserService.addUser(lab.getGlabSpaceApiInfo(), user, externalRole);

      const token =
        await this.externalLabUserService.generateTempAccess(lab.getGlabSpaceApiInfo(),
          CnCurrentUserHelper.getAndCheckCurrentUser(), lab.space);

      return new CnLabToken(lab, token.temp_token);
      // eslint-disable-next-line no-empty
    } catch (e: any) {
      return null;
    }
  }


  public async checkLabManagerStatus(labId: string): Promise<any> {
    const lab: CnLab = await this.getAndCheckAuthorizationToFindById(labId);

    if (lab.isDesktop()) {
      throw new BlBadRequestException(CnErrorText.CANT_MANAGE_DESKTOP_LAB);
    }

    const isRunning = await this.externalLabApiService.healthCheck(lab.getGlabSpaceApiInfo());
    this.logger.log('Lab ' + labId + ' is running : ' + isRunning);
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

  public async addUserToLab(labId: string, userId: string, role: CnLabUserRole): Promise<CnLabUser> {
    const lab = await this.getAndCheckAuthorizationToManageLab(labId, false);
    const user = await this.usersService.findByIdAndCheck(userId);


    return await this.dataSource.transaction(async entityManager => {
      // create the relation between the group and the lab
      // use group if we share team latter
      const labGroup = await this.labUserService.createLabUser(lab, user, role, entityManager);

      if (lab.isHttpAccessible()) {
        // add the user to the lab is the lab is running
        const labIsRunning = await this.externalLabApiService.healthCheck(lab.getGlabSpaceApiInfo());
        if (labIsRunning) {
          const externalRole: CnExternalLabUserRole = role === CnLabUserRole.OWNER ? 'ADMIN' : 'USER';
          await this.externalLabUserService.addUser(lab.getGlabSpaceApiInfo(), user, externalRole);
        }
      }

      return labGroup;
    });
  }

  public async updateUserLabRole(labId: string, groupId: string, role: CnLabUserRole): Promise<CnLabUser> {
    await this.getAndCheckAuthorizationToManageLab(labId, false);

    return this.labUserService.updateLabUserRole(labId, groupId, role);
  }

  public async removeUserFromLab(labId: string, userId: string): Promise<void> {
    const lab = await this.getAndCheckAuthorizationToManageLab(labId, false);

    return await this.dataSource.transaction(async entityManager => {
      await this.labUserService.deleteLabUser(labId, userId, entityManager);

      if (lab.isHttpAccessible()) {
        // add the user to the lab is the lab is running
        const labIsRunning = await this.externalLabApiService.healthCheck(lab.getGlabSpaceApiInfo());

        if (labIsRunning) {
          // deactivate the user in the lab
          await this.externalLabUserService.deactivateUser(lab.getGlabSpaceApiInfo(), userId);
        }
      }
    });
  }

  /**
   * Return the list of shared group for tha root folder
   */
  public async getLabSharedUsers(labId: string): Promise<CnLabUser[]> {
    const lab = await this.getAndCheckAuthorizationToFindById(labId);

    return this.labUserService.findByLabId(lab.id);
  }

  //////////////////////////// LAB MANAGER ////////////////////////////////

  public async getLabManagerStatus(labId: string): Promise<any> {
    const lab = await this.getAndCheckAuthorizationToManageLab(labId);
    return this.labManagerService.getLabStatus(lab);
  }

  public async listContainers(labId: string): Promise<CnLabManagerDockerPs[]> {
    const lab = await this.getAndCheckAuthorizationToManageLab(labId);
    return this.labManagerService.listContainers(lab);
  }

  public async getContainerDetails(labId: string, containerName: string): Promise<CnLabManagerDockerPsFull> {
    const lab = await this.getAndCheckAuthorizationToManageLab(labId);
    return this.labManagerService.getContainerDetails(lab, containerName);
  }

  public async startComposeContainer(labId: string, serviceName: string): Promise<void> {
    const lab = await this.getAndCheckAuthorizationToManageLab(labId);
    return this.labManagerService.startComposeContainer(lab, serviceName);
  }

  public async stopContainer(labId: string, containerName: string): Promise<boolean> {
    const lab = await this.getAndCheckAuthorizationToManageLab(labId);
    return this.labManagerService.stopContainer(lab, containerName);
  }

  public async deleteContainer(labId: string, containerName: string): Promise<boolean> {
    const lab = await this.getAndCheckAuthorizationToManageLab(labId);
    return this.labManagerService.deleteContainer(lab, containerName);
  }

  public async getLogs(labId: string, containerName: string): Promise<string> {
    const lab = await this.getAndCheckAuthorizationToManageLab(labId);
    return this.labManagerService.getLogs(lab, containerName);
  }

  public async exportLogs(labId: string, containerName: string): Promise<string> {
    const lab = await this.getAndCheckAuthorizationToManageLab(labId);
    return this.labManagerService.exportLogs(lab, containerName);
  }

  public async initAll(labId: string): Promise<void> {
    const lab = await this.getAndCheckServerStatusBeforeAction(labId);
    this.checkServerIsRunning(lab);
    await this.labManagerService.initAll(lab, lab.space.domain);
    await this.refreshLabStatus(lab.id);
  }

  public async configureLabManager(labId: string): Promise<void> {
    const lab = await this.getAndCheckServerStatusBeforeAction(labId);
    this.checkServerIsRunning(lab);
    return this.labManagerService.configureLabManager(lab, lab.space.domain);
  }

  public async upContainers(labId: string, options?: CnLabManagerComposeUpOptions): Promise<void> {
    const lab = await this.getAndCheckServerStatusBeforeAction(labId);
    this.checkServerIsRunning(lab);
    await this.labManagerService.upContainers(lab, options);
    await this.refreshLabStatus(lab.id);
  }

  public async restartContainers(labId: string, options?: CnManagerLabComposeRestartOptions): Promise<void> {
    const lab = await this.getAndCheckServerStatusBeforeAction(labId);
    this.checkServerIsRunning(lab);
    await this.labManagerService.restartContainers(lab, options);
    await this.refreshLabStatus(lab.id);
  }

  public async stopContainers(labId: string): Promise<void> {
    const lab = await this.getAndCheckServerStatusBeforeAction(labId);
    this.checkServerIsRunning(lab);
    await this.labManagerService.stopContainers(lab);
    await this.refreshLabStatus(lab.id);
  }

  public async deleteContainers(labId: string): Promise<void> {
    const lab = await this.getAndCheckServerStatusBeforeAction(labId);
    this.checkServerIsRunning(lab);
    await this.labManagerService.deleteContainers(lab);
    await this.refreshLabStatus(lab.id);
  }

  public async pullContainers(labId: string): Promise<void> {
    const lab = await this.getAndCheckAuthorizationToManageLab(labId);
    this.checkServerIsRunning(lab);
    return this.labManagerService.pullContainers(lab);
  }

  public async pullBiota(labId: string, options: CnManagerLabPullBiotaOptions): Promise<void> {
    const lab = await this.getAndCheckAuthorizationToManageLab(labId);
    this.checkServerIsRunning(lab);
    return this.labManagerService.pullBiota(lab, options);
  }

  public async stopCurrentTask(labId: string): Promise<void> {
    const lab = await this.getAndCheckAuthorizationToManageLab(labId);
    this.checkServerIsRunning(lab);
    return this.labManagerService.stopCurrentTask(lab);
  }

  public async systemPrune(labId: string): Promise<void> {
    const lab = await this.getAndCheckAuthorizationToManageLab(labId);
    this.checkServerIsRunning(lab);
    return this.labManagerService.systemPrune(lab);
  }

  public async getLabManagerConfig(labId: string): Promise<CnLabConfigDTO> {
    const lab = await this.getAndCheckAuthorizationToManageLab(labId);
    return this.labManagerService.getConfig(lab);
  }

  public async startAdminer(labId: string): Promise<boolean> {
    const lab = await this.getAndCheckAuthorizationToManageLab(labId);
    this.checkServerIsRunning(lab);
    return this.labManagerService.startAdminer(lab);
  }

  public async stopAdminer(labId: string): Promise<boolean> {
    const lab = await this.getAndCheckAuthorizationToManageLab(labId);
    this.checkServerIsRunning(lab);
    return this.labManagerService.stopAdminer(lab);
  }

  public getLabManagerRecommendedVersion(): string {
    return this.labManagerService.getLabManagerRecommendedVersion();
  }

  /////////////////////////// BACKUP ////////////////////////////////

  public async createProdBackup(labId: string): Promise<CnLabBucketHistory[]> {
    const lab = await this.getAndCheckAuthorizationToManageLab(labId);

    return this.backupService.createProdBackup(lab);
  }

  public async stopCurrentBackup(labId: string): Promise<CnLabBucketHistory[]> {
    const lab = await this.getAndCheckAuthorizationToManageLab(labId);
    return this.backupService.stopCurrentBackup(lab);
  }

  public async syncBackupHistory(labId: string): Promise<void> {
    const lab = await this.getAndCheckAuthorizationToFindById(labId);
    return this.backupService.syncBackupHistory(lab);
  }

  public async getBackupsStatus(labId: string): Promise<CnLabBackupStatusDTO[]> {
    const lab = await this.getAndCheckAuthorizationToFindById(labId);
    return this.backupService.getBackupsStatus(lab);
  }

  public async getLabBackupHistory(labId: string, page: number, size: number): Promise<ClPageI<CnLabBucketHistory>> {
    await this.getAndCheckAuthorizationToFindById(labId);
    return this.backupService.getBackupHistory(labId, page, size);
  }

  public async getBackupStatusAdmin(labId: string): Promise<any> {
    const lab = await this.getAndCheckAuthorizationToFindById(labId);
    // for now this route is only for admin
    if (!CnCurrentUserHelper.isAdmin()) {
      throw new BlUnauthorizedException();
    }
    return this.backupService.checkBackupsSize(lab);
  }

  public async deleteLabBackups(labId: string): Promise<void> {
    const lab = await this.getAndCheckAuthorizationToManageLab(labId);

    if (lab.currentStatus.status !== CnLabStatus.NO_SERVER) {
      throw new BlBadRequestException('The backup can\'t be deleted as long as the ' +
        'server for the lab exists. Please delete the lab server first.');
    }

    return this.backupService.deleteLabAllBackups(lab);
  }

  public async restoreBackup(sourceLabId: string, backupHistoryId: string,
                             restoreConfig: CnLabManagerRestoreBackupConfigDTO): Promise<CnLab> {
    this.security.checkAuthorizationToRestoreBackup(CnCurrentUserHelper.getAndCheckUserSpaceInfo());
    const sourceLab = await this.labsService.findByIdAndCheckWithSpace(sourceLabId);
    const destinationLab = await this.labsService.findByIdAndCheckWithSpace(restoreConfig.destinationLabId);
    await this.backupService.restoreBackup(sourceLab, destinationLab, backupHistoryId, restoreConfig);
    return destinationLab;
  }


  /////////////////////////// EXTERNAL LAB //////////////////////////////
  public async registerLabConfig(labStart: CnLabStartDTO): Promise<void> {
    const labConfig = await this.labConfigService.getOrCreateLabConfig(labStart.lab_config);

    let lab: CnLab = CnCurrentUserHelper.getAndCheckCurrentLab();

    lab = await this.labsService.markInstanceAsLabRunning(lab.id);
    await this.updateLabConfig(lab, labConfig);
  }

  public async getCurrentLabSharedUsers(): Promise<CnExternalLabUser[]> {
    const labUsers = await this.labUserService.findByLabId(CnCurrentUserHelper.getAndCheckCurrentLab().id);
    return labUsers.map(labUsers => {
      const externalRole: CnExternalLabUserRole = labUsers.role === CnLabUserRole.OWNER ? 'ADMIN' : 'USER';
      return {
        id: labUsers.user.id,
        first_name: labUsers.user.firstname,
        last_name: labUsers.user.lastname,
        email: labUsers.user.email,
        group: externalRole,
        is_active: true,
        theme: labUsers.user.theme,
        lang: labUsers.user.lang,
        photo: labUsers.user.photo
      };
    });
  }

  public async checkUserCredentials(credentials: BlCredentials, ignoreCaptcha: boolean,
                                    ignore2Fa: boolean): Promise<CnExternalCheckCredentialResponse> {
    // check that the user has access to the lab
    const lab = await this.getAndCheckAuthorizationToFindById(CnCurrentUserHelper.getAndCheckCurrentLab().id);

    // check the credentials, if the lab is cloud, it needs a valid captcha
    // only check the captcha for constellab standard domain (because this is the only domain defined in google
    return this.authService.externalCheckCredentials(credentials, lab.isConstellabDomain() && !ignoreCaptcha, ignore2Fa);
  }

  /////////////////////////// EXTERNAL LAB MANAGER //////////////////////////////
  public async getCurrentLabBackupInfo(): Promise<CnLabManagerBackupInfoDTO> {
    const lab = CnCurrentUserHelper.getAndCheckCurrentLab();
    return this.backupService.getBackupInfo(lab);
  }

  public async saveCurrentLabBackupHistory(backupHistory: CnLabBackupsHistory): Promise<CnLabBucketHistory[]> {
    return this.backupService.saveBackupHistory(CnCurrentUserHelper.getAndCheckCurrentLab(), backupHistory);
  }


  /////////////////////////// SERVER //////////////////////////////

  public async getServerCompleteInfo(labId: string): Promise<CnCpCompleteInfo> {
    const lab = await this.getAndCheckAuthorizationToManageLab(labId);
    return this.labServerService.getCompleteInfo(lab);
  }

  public async initServer(labId: string): Promise<CnLabStatusDTO> {
    let lab: CnLab = await this.getAndCheckServerStatusBeforeAction(labId, true);

    lab = await this.labsService.markInstanceAsServerStarting(lab.id);

    // call the init async (return the server response immediately)
    this.initServerAsync(lab).catch(
      // if an error occurred we just refresh the lab status
      (error: Error) => this.onError(lab.id, `Error during server initialization : ${error.message}`, error)
    );

    return this.getStatus(lab);
  }

  private async initServerAsync(lab: CnLab): Promise<void> {

    lab = await this.createServerAsync(lab, false);

    // wait for the DNS to be ready
    // wait for 2 consecutive success because DNS propagation can take some time
    const labSshService = await this.cloudProviderFactory.getSshLabService(lab);
    await labSshService.waitForSshConnection(3);

    await this.configureServerAsync(lab, false);

    await this.refreshStatusAndServerText(lab.id);
  }

  public async createServer(labId: string): Promise<CnLabStatusDTO> {
    let lab: CnLab = await this.getAndCheckServerStatusBeforeAction(labId, true);

    lab = await this.labsService.markInstanceAsServerStarting(lab.id);

    // call the init async (return the server response immediately)
    this.createServerAsync(lab, true).catch(
      // if an error occurred we just refresh the lab status
      (error: Error) => this.onError(lab.id, `Error during server creation: ${error.message}`, error)
    );

    return this.getStatus(lab);
  }

  private async createServerAsync(lab: CnLab, refreshStatus: boolean): Promise<CnLab> {
    lab = await this.labServerService.initInstance(lab);

    if (refreshStatus) {
      lab = await this.refreshStatusAndServerText(lab.id);
    }


    return lab;
  }

  public async configureServer(labId: string): Promise<CnLabStatusDTO> {
    let lab: CnLab = await this.getAndCheckServerStatusBeforeAction(labId);

    const labSshService = await this.cloudProviderFactory.getSshLabService(lab);
    const sshTest = await labSshService.checkSshConnection();
    if (!sshTest) {
      throw new BlBadRequestException(`SSH connection to ${lab.virtualHost} failed`);
    }

    lab = await this.labsService.markInstanceAsServerStarting(lab.id);

    // call the init async (return the server response immediately)
    this.configureServerAsync(lab, true).catch(
      // if an error occurred we just refresh the lab status
      (error: Error) => this.onError(lab.id, `Error during server configuration: ${error.message}`, error)
    );

    return this.getStatus(lab);
  }

  public async configureServerAsync(lab: CnLab, refreshStatus: boolean): Promise<CnLab> {
    lab = await this.labConfigurerService.configureServer(lab);

    if (refreshStatus) {
      lab = await this.refreshStatusAndServerText(lab.id);
    }
    return lab;
  }

  private async refreshStatusAndServerText(labId: string): Promise<CnLab> {
    const status = await this.checkAndRefreshStatus(labId);
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

    return this.labsService.updateServerTask(labId, text, CnLabServerTaskStatus.SUCCESS);
  }

  private async onError(labId: string, message: string, error: Error): Promise<void> {
    this.logger.error(message);
    await this.labsService.updateServerTask(labId, message, CnLabServerTaskStatus.ERROR)
      .catch(err => this.logger.error(err));
    this.refreshLabStatus(labId).catch(err => this.logger.error(err));

    // log stack trace of error
    if (error.stack) {
      this.logger.error(error.stack);
    }
  }

  public async deleteServerInstance(labId: string): Promise<void> {
    const lab = await this.getAndCheckServerStatusBeforeAction(labId, true);

    this.security.checkAuthorizationToDeleteServer(CnCurrentUserHelper.getAndCheckUserSpaceInfo());
    await this.labServerService.deleteLabServerAndVolume(lab);

    await this.refreshLabStatus(labId);
  }

  async startInstance(id: string): Promise<CnLab> {
    const lab = await this.getAndCheckServerStatusBeforeAction(id, true);

    if (lab.isFreeLab) {
      const available = await this.labFreeService.freeLabStillValid(lab.id);

      if (!available) {
        throw new BlBadRequestException(CnErrorText.LAB_FREE_EXPIRED);
      }
    }

    return await this.labServerService.startLab(lab);
  }


  async stopInstance(id: string): Promise<CnLab> {
    const lab = await this.getAndCheckServerStatusBeforeAction(id, true);

    return this.labServerService.stopLab(lab);
  }

  async updateLabManager(labId: string, labManagerVersion: string): Promise<CnLabStatusDTO> {
    const lab = await this.getAndCheckServerStatusBeforeAction(labId);
    this.checkServerIsRunning(lab);

    await this.labConfigurerService.updateLabManager(lab, labManagerVersion);
    return this.getStatus(lab);
  }

  async updateLabConfigurer(labId: string): Promise<CnLabStatusDTO> {
    const lab = await this.getAndCheckServerStatusBeforeAction(labId);
    this.checkServerIsRunning(lab);

    await this.labConfigurerService.updateLabConfigurerRepo(lab);
    return this.getStatus(lab);
  }

  public async destroyLabConfigurerContainers(labId: string): Promise<CnLabStatusDTO> {
    const lab = await this.getAndCheckAuthorizationToManageLab(labId);
    this.checkServerIsRunning(lab);

    await this.labConfigurerService.composeDown(lab);
    return this.getStatus(lab);
  }

  public async migrateToGithub(labId: string): Promise<CnLabStatusDTO> {
    const lab = await this.getAndCheckAuthorizationToManageLab(labId);
    this.checkServerIsRunning(lab);

    await this.labConfigurerService.migrateToGithub(lab);
    return this.getStatus(lab);
  }

  async stopCurrentServerTask(labId: string): Promise<CnLabStatusDTO> {
    let lab: CnLab = await this.getAndCheckAuthorizationToManageLab(labId);

    if (lab.serverTaskStatus !== CnLabServerTaskStatus.RUNNING) {
      throw new BlBadRequestException('No task running');
    }

    lab = await this.labsService.updateServerTask(lab.id,
      `Last task stopped manually: ${lab.serverTaskText}`, CnLabServerTaskStatus.ERROR);
    return this.getStatus(lab);
  }

  ////////////////////////// STATUS RULES  //////////////////////////////

  public async createGreenOption(labId: string, greenOption: CnLabGreenOptionFormDto): Promise<CnLabGreenOption> {
    const lab = await this.getAndCheckAuthorizationToManageLab(labId);
    return this.labGreenOptionService.createFromDTO(greenOption, lab);
  }

  public async updateGreenOption(greenOptionId: string, greenOption: CnLabGreenOptionFormDto): Promise<CnLabGreenOption> {
    const greenOptionDb = await this.labGreenOptionService.findByIdAndCheck(greenOptionId);
    await this.getAndCheckAuthorizationToManageLab(greenOptionDb.labId);
    return this.labGreenOptionService.updateFromDTO(greenOptionId, greenOption);
  }

  public async deleteGreenOption(id: string): Promise<void> {
    const greenOption = await this.labGreenOptionService.findByIdAndCheck(id);
    await this.getAndCheckAuthorizationToManageLab(greenOption.labId);
    await this.labGreenOptionService.deleteById(id);
  }

  public async getGreenOptions(labId: string): Promise<CnLabGreenOption[]> {
    await this.getAndCheckAuthorizationToManageLab(labId);
    return this.labGreenOptionService.findRulesByLabId(labId);
  }

  ////////////////////////// KPI //////////////////////////////

  public async getLabRunningKpis(labId: string, request: CnLabStatusRunRequest):
    Promise<CnLabStatusRunResponse> {
    const lab = await this.getAndCheckAuthorizationToFindById(labId);

    let serverPrices: CnServerPrices;

    if (lab.isCloud() && lab.billingMode === CnLabBillingMode.HOURLY) {
      const labServerStandard = await this.labsService.getLabServerStandard(lab.id);
      serverPrices = await this.serverPriceService.getServerAllPrices(labServerStandard.id, 'ASC');
    }
    return this.labStatusService.getLabRunningKpisWithBilling(lab.id, request, serverPrices);
  }

  ////////////////////////// DESKTOP //////////////////////////////
  public async generateDesktopConfig(labId: string,
                                     desktopConfig: CnLabDesktopConfig): Promise<CnLabDesktopZipConfig> {
    const lab = await this.getAndCheckAuthorizationToFindById(labId);

    if (!lab.isDesktop()) {
      throw new BlBadRequestException('Lab is not desktop');
    }

    return this.labDesktopService.generateDesktopConfig(lab, desktopConfig);
  }


  //////////////////////////// AUTHORIZATION ////////////////////////////////
  private async getAndCheckAuthorizationToFindById(id: string): Promise<CnLabWithSpace> {
    const lab = await this.labsService.findByIdAndCheck(id, { space: true });
    await this.security.checkAuthorizationToFindById(lab, CnCurrentUserHelper.getAndCheckUserSpaceInfo());
    return lab;
  }


  private async getAndCheckAuthorizationToUpdateAdmin(id: string): Promise<CnLabWithSpace> {
    const lab = await this.labsService.findByIdAndCheckWithSpace(id);
    this.security.checkAuthorizationToUpdateAdmin(lab, CnCurrentUserHelper.getAndCheckUserSpaceInfo());
    return lab;
  }

  public async getAndCheckAuthorizationToManageLab(id: string, refuseDesktop: boolean = true): Promise<CnLabWithSpace> {
    const lab = await this.labsService.findByIdAndCheckWithSpace(id);

    if (refuseDesktop && lab.isDesktop()) {
      throw new BlBadRequestException(CnErrorText.CANT_MANAGE_DESKTOP_LAB);
    }
    await this.security.checkAuthorizationToManageLab(lab, CnCurrentUserHelper.getAndCheckUserSpaceInfo());
    return lab;
  }

  /**
   * Check if the user can manage the lab and stop it temporary.
   * It refreshes the lab status and check if the server is not busy
   * It checks if no scenario or task on the lab is running
   * @private
   */
  private async getAndCheckServerStatusBeforeAction(id: string, requiresCloudLab: boolean = false): Promise<CnLabWithSpace> {
    await this.refreshLabStatus(id);

    const lab = await this.getAndCheckAuthorizationToManageLab(id, true);

    if (requiresCloudLab && !lab.isCloud()) {
      throw new BlBadRequestException('This action is only available for cloud lab');
    }

    if (lab.serverIsBusy()) {
      throw new BlBadRequestException(`Server is ${lab.currentStatus.status} and cannot configured`);
    }

    if (lab.serverTaskIsRunning()) {
      throw new BlBadRequestException(`The task '${lab.serverTaskText}' is running on the lab, it can't be configured`);
    }

    // if the lab is not running, no need to check if an scenario is running
    if (!lab.isRunning()) return lab;

    await this.labServerService.checkLabActivity(lab);

    return lab;
  }

  private checkServerIsRunning(lab: CnLab): void {
    if (lab.serverIsStopped()) {
      throw new BlBadRequestException('Server is stopped, please start the server first');
    }
  }

  // TODO TO REMOVE
  public migrateBackup(): Promise<void> {
    return this.backupService.migrate();
  }

}
