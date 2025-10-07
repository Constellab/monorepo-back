import {
  BlBadRequestException,
  BlCredentials,
  BlExternalApiError,
  BlSearchParams,
  BlTranslateService,
  BlUnauthorizedException,
  BlVersion,
} from '@monorepo/back-core-lib';
import { ClDateHelper, ClPage, ClPageI, ClStringHelper } from '@monorepo/core-lib';
import { Injectable, Logger } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';

import { CnAuthService, CnExternalCheckCredentialResponse } from '../cn-auth/cn-auth.service';
import { CnBrickGWS } from '../cn-bricks/cn-brick.dto';
import { CnCloudProviderRegion } from '../cn-cloud-providers/cn-cloud-provider-regions/cn-cloud-provider-region.entity';
import { CnErrorText } from '../cn-core/model/config/cn-error-text.class';
import { CnCurrentUserHelper } from '../cn-core/utils/cn-current-user.helper';
import { CnExternalLabApiService } from '../cn-external-lab-api/cn-external-lab-api.service';
import { CnExternalLabUserService } from '../cn-external-lab-api/cn-external-lab-user.service';
import {
  CnExternalLabUser,
  CnExternalLabUserRole,
} from '../cn-external-lab-api/model/cn-external-lab-api.class';
import {
  CnLabManagerAdminerInfo,
  CnLabManagerBackupInfoDTO,
  CnLabManagerCleanOptions,
  CnLabManagerComposeList,
  CnLabManagerComposeUpOptions,
  CnLabManagerContainerSize,
  CnLabManagerCreateDnsChallenge,
  CnLabManagerDockerComposeUniqueId,
  CnLabManagerDockerInspect,
  CnLabManagerDockerLogs,
  CnLabManagerDockerPsFull,
  CnLabManagerErrorLogs,
  CnLabManagerInitConfig,
  CnLabManagerRestoreBackupConfigDTO,
  CnManagerLabComposeRestartOptions,
  CnManagerLabPullBiotaOptions,
} from '../cn-external-lab-api/model/cn-lab-manager.class';
import { CnLabConfigDto } from '../cn-lab-configs/cn-lab-config.dto';
import { CnLabConfig } from '../cn-lab-configs/cn-lab-config.entity';
import { CnLabConfigsService } from '../cn-lab-configs/cn-lab-configs.service';
import { CnUser } from '../cn-users/cn-user.entity';
import { CnUsersService } from '../cn-users/cn-users.service';
import {
  CnLabBackupsHistory,
  CnLabBackupStatusDTO,
  CnLabCheckBackupSizeDTO,
} from './backup/cn-lab-backup.dto';
import { CnLabBackupAggregateService } from './backup/cn-lab-backup-aggregate.service';
import { CnLabBackupHistory } from './backup/cn-lab-backup-history.entity';
import {
  CnLabBusyStatusDTO,
  CnLabCloudCreateDTO,
  CnLabCodelabDTO,
  CnLabConfigDTO,
  CnLabCreateAdminDTO,
  CnLabCreateDesktopDTO,
  CnLabFindOneDto,
  CnLabGlabApiInfo,
  CnLabServerInfoDTO,
  CnLabStartDTO,
  CnLabStatusDTO,
  CnLabUpdateAdminDTO,
  CnRequestLab,
  CnStopLabRequestDTO,
} from './cn-lab.dto';
import {
  CnLab,
  CnLabBillingMode,
  CnLabDomain,
  CnLabEntity,
  CnLabFull,
  CnLabType,
  CnLabWithSpace,
} from './cn-lab.entity';
import { CnLabManagerService } from './cn-lab-manager.service';
import { CnLabsSecurity } from './cn-labs.security';
import { CnLabsService } from './cn-labs.service';
import { CnLabDesktopGenerateConfig } from './desktop/cn-lab-desktop.class';
import { CnLabDesktopService } from './desktop/cn-lab-desktop.service';
import { CnLabGreenOptionFormDto } from './green-option/cn-lab-green-option.dto';
import { CnLabGreenOption } from './green-option/cn-lab-green-option.entity';
import { CnLabGreenOptionService } from './green-option/cn-lab-green-option.service';
import { CnLabFreeService } from './lab-free/cn-lab-free.service';
import { CnLabMailService } from './mail/cn-lab-mail.service';
import { CnCpCompleteInfo } from './server/cn-cloud-provider.class';
import { CnCloudProviderFactory } from './server/cn-cloud-provider.factory';
import { CnLabConfigurerService } from './server/cn-lab-configurer.service';
import { CnLabServerService } from './server/cn-lab-server.service';
import { CnLabStatsRunningResponseDTO } from './stats/cn-lab-running-stats.dto';
import { CnLabStatsRequestDTO } from './stats/cn-lab-stats.dto';
import { CnLabStatsAggregateService } from './stats/cn-lab-stats-aggregate.service';
import { CnLabStatsStorageResponseDTO } from './stats/cn-lab-storage-stats.dto';
import { CnLabServerTaskStatus, CnLabStatus } from './status/cn-lab-status.enum';
import { CnLabStatusHistory } from './status/cn-lab-status-history.entity';
import { CnLabStatusHistoryService } from './status/cn-lab-status-history.service';
import { CnLabToken } from './user/cn-lab-token.class';
import { CnLabUserRole, CnLabUserWithUser } from './user/cn-lab-user.entity';
import { CnLabUserService } from './user/cn-lab-user.service';
import { CnLabUpdateVolumeDTO } from './volume/cn-lab-volume.dto';
import { CnLabVolumeService } from './volume/cn-lab-volume.service';
import { CnLabVolume, CnLabVolumeType } from './volume/cn-lab-volume-entity';

@Injectable()
export class CnLabAggregateService {
  private readonly logger = new Logger(CnLabAggregateService.name);

  constructor(
    private labsService: CnLabsService,
    private labUserService: CnLabUserService,
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
    private labMailService: CnLabMailService,
    private labGreenOptionService: CnLabGreenOptionService,
    private authService: CnAuthService,
    private labFreeService: CnLabFreeService,
    private backupService: CnLabBackupAggregateService,
    private labVolumeService: CnLabVolumeService,
    private labStatusHistoryService: CnLabStatusHistoryService,
    private labStatsAggregateService: CnLabStatsAggregateService,
    private labDesktopService: CnLabDesktopService,
    private translateService: BlTranslateService
  ) {}

  /**
   * Create a lab with all information (only for admin)
   */
  async createAdmin(createLab: CnLabCreateAdminDTO): Promise<CnLabEntity> {
    const lab = this.labFromUpdateAdminDTO(createLab);

    const userInfo = CnCurrentUserHelper.getAndCheckUserSpaceInfo();
    this.security.checkAuthorizationToCreateAdmin(lab, userInfo);

    return this.dataSource.transaction(async (entityManager) => {
      return this.createLabNotSecure(
        lab,
        createLab.volumeSize,
        createLab.volumeType,
        createLab.dailyBackupRegion,
        createLab.weeklyBackupRegion,
        entityManager
      );
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
    lab.isFreeLab = false;
    lab.space = CnCurrentUserHelper.getCurrentSpace();
    lab.virtualHost = ClStringHelper.generateUUID() + '.' + CnLabDomain.CONSTELLAB_APP;

    // handle lab config
    const configDto: CnLabConfigDto = {
      version: 1,
      brick_versions: cloudCreateDTO.labConfig.brickVersions,
    };
    lab.labConfig = await this.labConfigService.getOrCreateLabConfig(configDto);

    const labDb = await this.dataSource.transaction(async (entityManager) => {
      const labDb = await this.createLabNotSecure(
        lab,
        cloudCreateDTO.volumeSize,
        CnLabVolumeType.HIGH_SPEED,
        cloudCreateDTO.dailyBackupRegion,
        cloudCreateDTO.weeklyBackupRegion,
        entityManager
      );

      await this.labUserService.createLabUser(
        lab,
        CnCurrentUserHelper.getAndCheckCurrentUser(),
        CnLabUserRole.OWNER,
        entityManager
      );

      return labDb;
    });

    // init the server asynchronously
    await this.initServer(lab.id);

    return labDb;
  }

  public async createLabNotSecure(
    lab: CnLabEntity,
    volumeSize: number,
    volumeType: CnLabVolumeType,
    dailyBackupRegion: CnCloudProviderRegion,
    weeklyBackupRegion: CnCloudProviderRegion,
    entityManager: EntityManager
  ): Promise<CnLabEntity> {
    const labDb: CnLabEntity = await this.labsService.createLab(lab, entityManager);

    if (labDb.isDesktop()) {
      return labDb;
    }

    if (lab.isCloud()) {
      if (!volumeSize || volumeSize <= 0) {
        throw new BlBadRequestException('Volume size is required for a cloud lab');
      }

      if (!lab.isFreeLab) {
        if (dailyBackupRegion == null || weeklyBackupRegion == null) {
          throw new BlBadRequestException('Backup regions are required for a cloud lab');
        }

        await this.backupService.createBackupOptions(
          labDb,
          dailyBackupRegion,
          weeklyBackupRegion,
          entityManager
        );
      }
    }

    await this.labVolumeService.createVolume(labDb, labDb.createdAt, volumeSize, volumeType, entityManager);

    return labDb;
  }

  /**
   * Update a lab with all information (only for admin)
   */
  async updateAdmin(updateLab: CnLabUpdateAdminDTO): Promise<CnLabFull> {
    await this.getAndCheckAuthorizationToUpdateAdmin(updateLab.id);
    const lab = this.labFromUpdateAdminDTO(updateLab);

    return this.labsService.updateLab(lab);
  }

  private labFromUpdateAdminDTO(updateLab: CnLabUpdateAdminDTO): CnLabEntity {
    const lab = new CnLabEntity();
    lab.id = updateLab.id;
    lab.name = updateLab.name;
    lab.type = updateLab.type;
    lab.virtualHost = updateLab.virtualHost;
    lab.billingMode = updateLab.billingMode;
    lab.serverCloud = updateLab.serverCloud;
    lab.glabProdApiKey = updateLab.glabProdApiKey;
    lab.glabDevApiKey = updateLab.glabDevApiKey;
    lab.labManagerApiKey = updateLab.labManagerApiKey;
    lab.codelabToken = updateLab.codelabToken;
    lab.region = updateLab.region;
    lab.space = updateLab.space;
    lab.serverInstanceId = updateLab.serverInstanceId;
    lab.serverVolumeId = updateLab.serverVolumeId;
    lab.serverIpAddressId = updateLab.serverIpAddressId;
    lab.desktopPlatform = updateLab.desktopPlatform;
    lab.gwsCoreProdDbPassword = updateLab.gwsCoreProdDbPassword;
    lab.gwsCoreDevDbPassword = updateLab.gwsCoreDevDbPassword;
    return lab;
  }

  async updateLabName(id: string, name: string): Promise<CnLab> {
    const labDb: CnLab = await this.labsService.findByIdAndCheck(id);
    await this.security.checkAuthorizationToManageLab(labDb, CnCurrentUserHelper.getAndCheckUserSpaceInfo());
    return this.labsService.updateLabName(id, name);
  }

  async delete(id: string): Promise<void> {
    const lab = await this.getAndCheckAuthorizationToUpdateAdmin(id);

    await this.deleteLabNotSecure(lab);
  }

  async deleteDesktopLab(id: string): Promise<void> {
    const lab = await this.getAndCheckAuthorizationToManageLab(id, false);

    if (!lab.isDesktop()) {
      throw new BlBadRequestException('Can only delete desktop labs');
    }

    await this.deleteLabNotSecure(lab);
  }

  private deleteLabNotSecure(lab: CnLab): Promise<void> {
    return this.dataSource.transaction(async (entityManager) => {
      await this.backupService.deleteBackupOptions(lab, entityManager);
      await this.labsService.deleteById(lab.id, entityManager);
    });
  }

  async requestLab(request: CnRequestLab): Promise<void> {
    const userInfo = CnCurrentUserHelper.getAndCheckUserSpaceInfo();
    return this.labMailService.sendRequestLabMail(request, userInfo.user, userInfo.space);
  }

  async findByIdAndCheck(id: string): Promise<CnLabFindOneDto> {
    const lab = await this.labsService.findByIdAndCheck(id);
    const userRole = await this.security.checkAuthorizationToFindById(
      lab,
      CnCurrentUserHelper.getAndCheckUserSpaceInfo()
    );
    return new CnLabFindOneDto(lab, userRole);
  }

  async findCodelabInfo(id: string): Promise<CnLabCodelabDTO> {
    const lab = await this.labsService.findByIdAndCheck(id);
    await this.security.checkAuthorizationToFindById(lab, CnCurrentUserHelper.getAndCheckUserSpaceInfo());
    return {
      username: lab.getCodelabUsername(),
      token: lab.codelabToken,
      url: lab.getCodelabUrl(),
    };
  }

  async getByCurrentSpace(page: number, size: number): Promise<ClPageI<CnLab>> {
    this.security.checkAuthorizationToFindAllBySpace(CnCurrentUserHelper.getAndCheckUserSpaceInfo());
    return this.labsService.findBySpace(CnCurrentUserHelper.getAndCheckCurrentSpace().id, page, size);
  }

  getCurrentLabs(page: number, size: number): Promise<ClPageI<CnLab>> {
    // no security check because the get is filtered with user id
    return this.labsService.getUserLabs(
      CnCurrentUserHelper.getAndCheckCurrentUser().id,
      CnCurrentUserHelper.getAndCheckCurrentSpace().id,
      page,
      size
    );
  }

  getCurrentRunningLabs(): Promise<CnLab[]> {
    // no security check because the get is filtered with user id
    return this.labsService.getUserRunningLabs(
      CnCurrentUserHelper.getAndCheckCurrentUser().id,
      CnCurrentUserHelper.getAndCheckCurrentSpace().id
    );
  }

  async searchAll(searchParams: BlSearchParams, page: number, size: number): Promise<ClPage<CnLabFull>> {
    this.security.checkAuthorizationToFindAll(CnCurrentUserHelper.getAndCheckUserSpaceInfo());

    return this.labsService.searchAll(searchParams, page, size);
  }

  async searchInCurrentSpace(
    searchParams: BlSearchParams,
    page: number,
    size: number
  ): Promise<ClPage<CnLabFull>> {
    this.security.checkAuthorizationToFindAllBySpace(CnCurrentUserHelper.getAndCheckUserSpaceInfo());

    return this.labsService.searchInSpace(
      CnCurrentUserHelper.getAndCheckUserSpaceInfo().spaceId,
      searchParams,
      page,
      size
    );
  }

  public async getConfig(id: string): Promise<CnLabConfig> {
    const lab = await this.getAndCheckAuthorizationToFindById(id);

    if (lab.labConfigId == null) {
      throw new BlBadRequestException(CnErrorText.LAB_CONFIG_NOT_FOUND);
    }

    return this.labConfigService.getCompleteConfig(lab.labConfigId);
  }

  public async getGlabConfig(lab: CnLab): Promise<CnLabGlabApiInfo> {
    const gwsCoreVerson = await this.labConfigService.getLabBrickVersion(
      lab.labConfigId,
      CnBrickGWS.GWS_CORE
    );
    return {
      gwsCoreVersion: gwsCoreVerson.version,
      apiInfo: lab.getGlabSpaceApiInfo(),
    };
  }

  /**
   * Update the lab bricks config.
   * If the lab is desktop, the config is updated directly in the lab.
   * If the lab is on cloud, it only updates the lab manager config
   * (the config is then update when the lab is restarted)
   * @param labId
   * @param config
   */
  public async updateConfig(labId: string, config: CnLabConfigDTO): Promise<void> {
    // check if the gws core is in the brick list
    const gwsCore = config.brickVersions.find(
      (brickVersion) => brickVersion.name.toLowerCase() === CnBrickGWS.GWS_CORE.toLowerCase()
    );

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
        brick_versions: config.brickVersions,
      });

      await this.updateLabConfig(lab, labConfig);
    }
  }

  /**
   * Update bricks in the current config to minimum versions from the new config
   * @param labId
   * @param newConfig Config containing minimum versions to apply
   */
  public async updateBricksToMinimumVersion(labId: string, newConfig: CnLabConfigDTO): Promise<void> {
    // Get the current config from the database
    const currentLabConfig = await this.getConfig(labId);
    const currentConfig = currentLabConfig.toLabConfigDTO();

    const updatedBrickVersions = currentConfig.brickVersions.map((currentBrick) => {
      // Find the brick in the new config
      const newBrick = newConfig.brickVersions.find(
        (brick) => brick.name.toLowerCase() === currentBrick.name.toLowerCase()
      );

      // If brick exists in new config and has a higher version, update it
      if (newBrick) {
        const currentVersion = BlVersion.fromString(currentBrick.version);
        const newVersion = BlVersion.fromString(newBrick.version);

        if (newVersion.isGreaterThanOrEqualTo(currentVersion)) {
          return { ...currentBrick, version: newBrick.version };
        }
      }

      return currentBrick;
    });

    const updatedConfig: CnLabConfigDTO = {
      brickVersions: updatedBrickVersions,
    };

    await this.updateConfig(labId, updatedConfig);
  }

  private async updateLabConfig(lab: CnLab, labConfig: CnLabConfig): Promise<CnLab> {
    return this.labsService.updateLabConfig(lab.id, labConfig);
  }

  public async getLabServerInfo(labId: string): Promise<CnLabServerInfoDTO> {
    const lab = await this.getAndCheckAuthorizationToFindById(labId);
    if (!lab.isCloud()) {
      throw new BlBadRequestException('The lab is not on a cloud server');
    }

    const fullLab = await this.labsService.findByIdAndCheck(labId, { serverCloud: true });

    const serverInfo = new CnLabServerInfoDTO();
    serverInfo.name = fullLab.serverCloud.serverStandard.name;
    serverInfo.cloudProvider = fullLab.serverCloud.cloudProvider;
    serverInfo.cpuType = fullLab.serverCloud.cpuType;
    serverInfo.cpuCount = fullLab.serverCloud.cpuCount;
    serverInfo.gpuType = fullLab.serverCloud.gpuType;
    serverInfo.gpuCount = fullLab.serverCloud.gpuCount;
    serverInfo.ram = fullLab.serverCloud.ram;

    const volume = await this.labVolumeService.getCurrentVolume(labId);
    if (volume) {
      serverInfo.volumeSize = volume.size;
      serverInfo.volumeType = volume.type;
    }
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
      this.externalLabApiService.healthCheck(lab.getGlabSpaceApiInfo()),
    ];

    return Promise.all(promises).then(async ([labManagerStatus, glabStatus]) => {
      // if the lab is marked as stopped but the glab is accessible force refresh status
      if (lab.isHttpAccessible() && glabStatus && lab.currentStatus.status === CnLabStatus.SERVER_STOPPED) {
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

  /**
   * Get the busy status of the lab
   * Lab is considered busy if an action on server or lab manager is running
   */
  public async getLabBusyStatus(id: string): Promise<CnLabBusyStatusDTO> {
    let lab: CnLab = await this.getAndCheckAuthorizationToFindById(id);

    if (lab.serverTaskIsRunning()) {
      let mainText: string;
      if (lab.currentStatus.status === CnLabStatus.SERVER_STARTING) {
        mainText = await this.translateService.translateIfExists('message.lab_busy_server_starting');
      } else if (lab.currentStatus.status === CnLabStatus.SERVER_STOPPING) {
        mainText = await this.translateService.translateIfExists('message.lab_busy_lab_stopping');
      } else {
        mainText = await this.translateService.translateIfExists('message.lab_busy_task_running');
      }

      return new CnLabBusyStatusDTO(lab, true, {
        mainText,
        subText: lab.serverTaskText,
        datetime: lab.serverTaskDatetime,
      });
    }

    // if the lab is stopping, we return a busy status
    if (lab.currentStatus.status === CnLabStatus.SERVER_STOPPING) {
      return new CnLabBusyStatusDTO(lab, true, {
        mainText: await this.translateService.translateIfExists('message.lab_busy_lab_stopping'),
      });
    }

    if (lab.currentStatus.status === CnLabStatus.SERVER_STARTING) {
      return new CnLabBusyStatusDTO(lab, true, {
        mainText: await this.translateService.translateIfExists('message.lab_busy_server_starting'),
      });
    }

    if (lab.isHttpAccessible()) {
      const labIsRunning = await this.externalLabApiService.healthCheck(lab.getGlabSpaceApiInfo());
      // if the lab is marked as stopped but the glab is accessible force refresh status
      if (labIsRunning) {
        if (!lab.isRunning()) {
          lab = await this.refreshLabStatus(lab.id);
        }
        return new CnLabBusyStatusDTO(lab, false);
      }
    }

    // if there is not running task and the lab is running or stopped, there is no busy status
    if (lab.serverIsStopped()) {
      return new CnLabBusyStatusDTO(lab, false);
    }

    if (lab.currentStatus.status === CnLabStatus.SERVER_RUNNING) {
      return new CnLabBusyStatusDTO(lab, true, {
        mainText: await this.translateService.translateIfExists('message.lab_busy_manager_starting'),
      });
    }

    // case of the lab starting without a task running
    // we need to check the lab manager status
    try {
      const labManagerStatus = await this.labManagerService.getLabStatus(lab);

      if (labManagerStatus.labStatus === 'STARTING') {
        return new CnLabBusyStatusDTO(lab, true, {
          mainText: await this.translateService.translateIfExists('message.lab_busy_lab_starting'),
          progress: labManagerStatus.glabStatus?.startProgress,
        });
      }

      if (labManagerStatus.currentTask?.status === 'RUNNING') {
        let subText = labManagerStatus.currentTask.name;
        if (labManagerStatus.currentTask?.info) {
          subText += ' ' + labManagerStatus.currentTask?.info;
        }
        return new CnLabBusyStatusDTO(lab, true, {
          mainText: await this.translateService.translateIfExists('message.lab_busy_manager_task_running'),
          subText,
        });
      }
    } catch {
      return new CnLabBusyStatusDTO(lab, true, {
        mainText: await this.translateService.translateIfExists('message.lab_busy_starting_wait'),
      });
    }

    return new CnLabBusyStatusDTO(lab, false);
  }

  public async getLabStatusHistory(
    labId: string,
    page: number,
    size: number,
    searchParams: BlSearchParams
  ): Promise<ClPageI<CnLabStatusHistory>> {
    await this.getAndCheckAuthorizationToFindById(labId);
    return this.labStatusHistoryService.getStatusHistoryPaginated(page, size, labId, searchParams);
  }

  public async getUsersOfStatusHistory(labId: string, page: number, size: number): Promise<ClPageI<CnUser>> {
    await this.getAndCheckAuthorizationToFindById(labId);
    const usersIds = await this.labStatusHistoryService.getUsersOfStatusHistory(labId);

    return this.usersService.findByIds(usersIds, page, size);
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
        const text =
          serverStatus.message?.length > 0 ? serverStatus.message : 'No information about the error';
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

  /////////////////////////////////////// VOLUME //////////////////////////////////

  public async updateLabVolume(id: string, updateVolume: CnLabUpdateVolumeDTO): Promise<CnLabVolume> {
    const lab = await this.getAndCheckAuthorizationToUpdateAdmin(id);

    return this.labVolumeService.updateLabVolume(lab, updateVolume);
  }

  public async getLabCurrentVolume(id: string): Promise<CnLabVolume> {
    await this.getAndCheckAuthorizationToFindById(id);

    return this.labVolumeService.getCurrentVolume(id);
  }

  public async getLabVolumeHistory(labId: string, page: number, size: number): Promise<ClPage<CnLabVolume>> {
    await this.getAndCheckAuthorizationToFindById(labId);

    return this.labVolumeService.getVolumeHistory(labId, page, size);
  }

  public async deleteLabVolumeHistory(id: string, volumeId: string): Promise<void> {
    await this.getAndCheckAuthorizationToUpdateAdmin(id);
    await this.labVolumeService.deleteLabVolume(id, volumeId);
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
      const token = await this.externalLabUserService.generateTempAccess(
        lab.getGlabSpaceApiInfo(),
        user,
        lab.space
      );

      return new CnLabToken(lab, token.temp_token);
    } catch (e: any) {
      const error = e as BlExternalApiError;

      // we try to add the user to the lab and reconnect
      const instanceToken = await this.addUserAndConnect(lab, CnCurrentUserHelper.getAndCheckCurrentUser());
      if (instanceToken) {
        return instanceToken;
      }

      switch (error.knownError?.code ?? null) {
        case 'gws_core.WRONG_CREDENTIALS_USER_NOT_ACTIVATED':
          throw new BlUnauthorizedException(CnErrorText.LAB_USER_NOT_ACTIVATED);
        case 'gws_core.WRONG_CREDENTIALS_USER_NOT_FOUND':
        case 'gws_core.OBJECT_ID_NOT_FOUND':
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
    const group = await this.labUserService.findByLabIdAndUserId(lab.id, user.id);
    if (!group) return null;

    try {
      const externalRole: CnExternalLabUserRole = group.role === CnLabUserRole.OWNER ? 'ADMIN' : 'USER';
      await this.externalLabUserService.addUser(lab.getGlabSpaceApiInfo(), user, externalRole);

      const token = await this.externalLabUserService.generateTempAccess(
        lab.getGlabSpaceApiInfo(),
        CnCurrentUserHelper.getAndCheckCurrentUser(),
        lab.space
      );

      return new CnLabToken(lab, token.temp_token);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_: any) {
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
      throw new BlBadRequestException("Can't retrieve the settings");
    }
  }

  /////////////////////////////////////// GROUPS //////////////////////////////////

  public async addUserToLab(labId: string, userId: string, role: CnLabUserRole): Promise<CnLabUserWithUser> {
    const lab = await this.getAndCheckAuthorizationToManageLab(labId, false);
    const user = await this.usersService.findByIdAndCheck(userId);

    return await this.dataSource.transaction(async (entityManager) => {
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

  public async updateUserLabRole(
    labId: string,
    groupId: string,
    role: CnLabUserRole
  ): Promise<CnLabUserWithUser> {
    const lab = await this.getAndCheckAuthorizationToManageLab(labId, false);

    return this.labUserService.updateLabUserRole(lab, groupId, role);
  }

  public async removeUserFromLab(labId: string, userId: string): Promise<void> {
    const lab = await this.getAndCheckAuthorizationToManageLab(labId, false);

    return this.removeUserFromLabNotSecure(lab, userId);
  }

  private async removeUserFromLabNotSecure(lab: CnLab, userId: string): Promise<void> {
    return await this.dataSource.transaction(async (entityManager) => {
      await this.labUserService.deleteLabUser(lab, userId, entityManager);

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

  public async removeUserFromAllLabs(userId: string, spaceId: string): Promise<void> {
    const labs = await this.labsService.getAllLabsByUserAndSpace(userId, spaceId);

    for (const lab of labs) {
      await this.removeUserFromLabNotSecure(lab, userId);
    }
  }

  /**
   * Return the list of shared group for tha root folder
   */
  public async getLabSharedUsers(labId: string): Promise<CnLabUserWithUser[]> {
    const lab = await this.getAndCheckAuthorizationToFindById(labId);

    return this.labUserService.findByLabId(lab.id);
  }

  //////////////////////////// LAB MANAGER ////////////////////////////////

  /////////////////////// LAB MANAGER - STATUS & HEALTH ///////////////////////

  public async getLabManagerStatus(labId: string): Promise<any> {
    const lab = await this.getAndCheckAuthorizationToManageLab(labId);
    return this.labManagerService.getLabStatus(lab);
  }

  public async getStartingError(labId: string): Promise<CnLabManagerErrorLogs> {
    const lab = await this.getAndCheckAuthorizationToManageLab(labId);
    return this.labManagerService.getStartingError(lab);
  }

  public getLabManagerRecommendedVersion(): string {
    return this.labManagerService.getLabManagerRecommendedVersion();
  }

  public async stopCurrentTask(labId: string): Promise<void> {
    const lab = await this.getAndCheckAuthorizationToManageLab(labId);
    this.checkServerIsRunning(lab);
    return this.labManagerService.stopCurrentTask(lab);
  }

  /////////////////////// LAB MANAGER - INITIALIZATION ///////////////////////

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

  public async pullBiota(labId: string, options: CnManagerLabPullBiotaOptions): Promise<void> {
    const lab = await this.getAndCheckAuthorizationToManageLab(labId);
    this.checkServerIsRunning(lab);
    return this.labManagerService.pullBiota(lab, options);
  }

  public async cleanLabManager(labId: string, options: CnLabManagerCleanOptions): Promise<void> {
    const lab = await this.getAndCheckAuthorizationToManageLab(labId);
    this.checkServerIsRunning(lab);
    return this.labManagerService.cleanLabManager(lab, options);
  }

  //////////////////////////////// LAB MANAGER - CONFIGURATION /////////////////////////////////

  public async getLabManagerConfig(labId: string): Promise<CnLabConfigDTO> {
    const lab = await this.getAndCheckAuthorizationToManageLab(labId);
    return this.labManagerService.getConfig(lab);
  }

  //////////////////////////// LAB MANAGER - DOCKER COMPOSE ///////////////////////////////

  public async getAllComposes(labId: string): Promise<CnLabManagerComposeList> {
    const lab = await this.getAndCheckAuthorizationToManageLab(labId);
    return this.labManagerService.getAllComposes(lab);
  }

  public async listServices(
    labId: string,
    composeId: CnLabManagerDockerComposeUniqueId
  ): Promise<CnLabManagerDockerInspect[]> {
    const lab = await this.getAndCheckAuthorizationToManageLab(labId);
    return this.labManagerService.listServices(lab, composeId);
  }

  public async startComposeService(
    labId: string,
    composeId: CnLabManagerDockerComposeUniqueId,
    serviceNames: string[]
  ): Promise<void> {
    const lab = await this.getAndCheckAuthorizationToManageLab(labId);
    return this.labManagerService.startComposeService(lab, composeId, serviceNames);
  }

  public async upServices(
    labId: string,
    composeId: CnLabManagerDockerComposeUniqueId,
    options: CnLabManagerComposeUpOptions
  ): Promise<void> {
    const lab = await this.getAndCheckAuthorizationToManageLab(labId);
    this.checkServerIsRunning(lab);
    return this.labManagerService.upServices(lab, composeId, options);
  }

  public async restartServices(
    labId: string,
    composeId: CnLabManagerDockerComposeUniqueId,
    options: CnManagerLabComposeRestartOptions
  ): Promise<void> {
    const lab = await this.getAndCheckAuthorizationToManageLab(labId);
    this.checkServerIsRunning(lab);
    return this.labManagerService.restartServices(lab, composeId, options);
  }

  public async stopServices(labId: string, composeId: CnLabManagerDockerComposeUniqueId): Promise<void> {
    const lab = await this.getAndCheckAuthorizationToManageLab(labId);
    this.checkServerIsRunning(lab);
    return this.labManagerService.stopServices(lab, composeId);
  }

  public async deleteServices(labId: string, composeId: CnLabManagerDockerComposeUniqueId): Promise<void> {
    const lab = await this.getAndCheckAuthorizationToManageLab(labId);
    this.checkServerIsRunning(lab);
    return this.labManagerService.deleteServices(lab, composeId);
  }

  public async pullServices(labId: string, composeId: CnLabManagerDockerComposeUniqueId): Promise<void> {
    const lab = await this.getAndCheckAuthorizationToManageLab(labId);
    this.checkServerIsRunning(lab);
    return this.labManagerService.pullServices(lab, composeId);
  }

  public async getComposeContent(
    labId: string,
    composeId: CnLabManagerDockerComposeUniqueId
  ): Promise<string> {
    const lab = await this.getAndCheckAuthorizationToManageLab(labId);
    return this.labManagerService.getComposeContent(lab, composeId);
  }

  public async unregisterSubCompose(
    labId: string,
    composeId: CnLabManagerDockerComposeUniqueId
  ): Promise<void> {
    const lab = await this.getAndCheckAuthorizationToManageLab(labId);
    return this.labManagerService.unregisterSubCompose(lab, composeId);
  }

  /////////////////////// LAB MANAGER - CONTAINERS //////////////////////////////

  public async getContainerDetails(labId: string, containerName: string): Promise<CnLabManagerDockerPsFull> {
    const lab = await this.getAndCheckAuthorizationToManageLab(labId);
    return this.labManagerService.getContainerDetails(lab, containerName);
  }

  public async getContainerSize(labId: string, containerName: string): Promise<CnLabManagerContainerSize> {
    const lab = await this.getAndCheckAuthorizationToManageLab(labId);
    return this.labManagerService.getContainerSize(lab, containerName);
  }

  public async stopContainer(labId: string, containerName: string): Promise<boolean> {
    const lab = await this.getAndCheckAuthorizationToManageLab(labId);
    return this.labManagerService.stopContainer(lab, containerName);
  }

  public async deleteContainer(labId: string, containerName: string): Promise<boolean> {
    const lab = await this.getAndCheckAuthorizationToManageLab(labId);
    return this.labManagerService.deleteContainer(lab, containerName);
  }

  public async getLogs(labId: string, containerName: string): Promise<CnLabManagerDockerLogs> {
    const lab = await this.getAndCheckAuthorizationToManageLab(labId);
    return this.labManagerService.getLogs(lab, containerName);
  }

  public async getErrorLogs(labId: string, containerName: string): Promise<CnLabManagerDockerLogs> {
    const lab = await this.getAndCheckAuthorizationToManageLab(labId);
    return this.labManagerService.getErrorLogs(lab, containerName);
  }

  public async exportLogs(labId: string, containerName: string): Promise<string> {
    const lab = await this.getAndCheckAuthorizationToManageLab(labId);
    return this.labManagerService.exportLogs(lab, containerName);
  }

  ////////////////////////////////////////// LAB MANAGER - ADMINER //////////////////////////////////////////

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

  public async getAdminerInfo(labId: string): Promise<CnLabManagerAdminerInfo> {
    const lab = await this.getAndCheckAuthorizationToManageLab(labId);
    this.checkServerIsRunning(lab);
    return this.labManagerService.getAdminerInfo(lab);
  }

  /////////////////////////// BACKUP ////////////////////////////////

  public async createProdBackup(labId: string): Promise<CnLabBackupHistory[]> {
    const lab = await this.getAndCheckAuthorizationToManageLab(labId);

    return this.backupService.createProdBackup(lab);
  }

  public async stopCurrentBackup(labId: string): Promise<CnLabBackupHistory[]> {
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

  public async getLabBackupHistory(
    labId: string,
    page: number,
    size: number
  ): Promise<ClPageI<CnLabBackupHistory>> {
    await this.getAndCheckAuthorizationToFindById(labId);
    return this.backupService.getBackupHistory(labId, page, size);
  }

  public async getBackupStatusAdmin(labId: string): Promise<CnLabCheckBackupSizeDTO[]> {
    const lab = await this.getAndCheckAuthorizationToFindById(labId);
    // for now this route is only for admin
    if (!CnCurrentUserHelper.isAdmin()) {
      throw new BlUnauthorizedException();
    }
    return await this.backupService.checkBackupsSize(lab);
  }

  public async deleteLabBackups(labId: string): Promise<void> {
    const lab = await this.getAndCheckAuthorizationToManageLab(labId);

    if (lab.currentStatus.status !== CnLabStatus.NO_SERVER) {
      throw new BlBadRequestException(
        "The backup can't be deleted as long as the " +
          'server for the lab exists. Please delete the lab server first.'
      );
    }

    return this.backupService.deleteLabAllBackups(lab);
  }

  public async restoreBackup(
    sourceLabId: string,
    backupHistoryId: string,
    restoreConfig: CnLabManagerRestoreBackupConfigDTO
  ): Promise<CnLab> {
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

  /**
   * return the list of lab users
   */
  public async getCurrentLabSharedUsers(): Promise<CnExternalLabUser[]> {
    const labUsers = await this.labUserService.findByLabId(CnCurrentUserHelper.getAndCheckCurrentLab().id);
    return labUsers.map((labUsers) => {
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
        photo: labUsers.user.photo,
      };
    });
  }

  /**
   * Get any user info from the lab. This might return a user that is not in the lab user list.
   * Useful for data hub where user may trigger an action without being in the lab user list)
   * @param userId
   */
  public async getUserInfoForCurrentLab(userId: string): Promise<CnExternalLabUser> {
    return this.getUserInfoForLab(userId, CnCurrentUserHelper.getAndCheckCurrentLab().id);
  }

  public async getUserInfoForLab(userId: string, labId: string): Promise<CnExternalLabUser> {
    const user = await this.usersService.findByIdAndCheck(userId);

    const labUser = await this.labUserService.findByLabIdAndUserId(labId, userId);
    return {
      id: user.id,
      first_name: user.firstname,
      last_name: user.lastname,
      email: user.email,
      group: 'USER',
      is_active: labUser != null,
      theme: user.theme,
      lang: user.lang,
      photo: user.photo,
    };
  }

  public async checkUserCredentials(
    credentials: BlCredentials,
    ignoreCaptcha: boolean,
    ignore2Fa: boolean
  ): Promise<CnExternalCheckCredentialResponse> {
    // check that the user has access to the lab
    const lab = await this.getAndCheckAuthorizationToFindById(CnCurrentUserHelper.getAndCheckCurrentLab().id);

    // check the credentials, if the lab is cloud, it needs a valid captcha
    // only check the captcha for constellab standard domain
    // (because this is the only domain defined in google)
    return this.authService.externalCheckCredentials(
      credentials,
      lab.isConstellabDomain() && !ignoreCaptcha,
      ignore2Fa
    );
  }

  /////////////////////////// EXTERNAL LAB MANAGER //////////////////////////////
  public async getCurrentLabBackupInfo(): Promise<CnLabManagerBackupInfoDTO> {
    const lab = CnCurrentUserHelper.getAndCheckCurrentLab();
    return this.backupService.getBackupInfo(lab);
  }

  public async saveCurrentLabBackupHistory(
    backupHistory: CnLabBackupsHistory
  ): Promise<CnLabBackupHistory[]> {
    return this.backupService.saveBackupHistory(CnCurrentUserHelper.getAndCheckCurrentLab(), backupHistory);
  }

  public async createDnsChallenge(body: CnLabManagerCreateDnsChallenge): Promise<void> {
    await this.labServerService.generateDnsChallengeForLab(CnCurrentUserHelper.getAndCheckCurrentLab(), body);
  }

  public async deleteDnsChallenge(): Promise<void> {
    await this.labServerService.cleanupDnsChallenge(CnCurrentUserHelper.getAndCheckCurrentLab());
  }

  public getDesktopUpdateLabManagerCommand(): string {
    return this.labDesktopService.getUpdateAndRunLabManagerCommand(
      CnCurrentUserHelper.getAndCheckCurrentLab()
    );
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
    lab = await this.labServerService.initInstance(lab, await this.labVolumeService.getCurrentVolume(lab.id));

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
    await this.labsService
      .updateServerTask(labId, message, CnLabServerTaskStatus.ERROR)
      .catch((err) => this.logger.error(err));
    this.refreshLabStatus(labId).catch((err) => this.logger.error(err));

    // log stack trace of error
    if (error.stack) {
      this.logger.error(error.stack);
    }
  }

  public async deleteServerInstance(labId: string): Promise<void> {
    const lab = await this.getAndCheckServerStatusBeforeAction(labId, true);

    this.security.checkAuthorizationToDeleteServer(CnCurrentUserHelper.getAndCheckUserSpaceInfo());
    await this.deleteServerInstanceNotSecure(lab);
  }

  public async deleteServerInstanceNotSecure(lab: CnLab): Promise<void> {
    await this.labServerService.deleteLabServerAndVolume(lab);
    await this.labVolumeService.markVolumeAsDeleted(lab, ClDateHelper.getDate());

    await this.refreshLabStatus(lab.id);
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

  async stopInstance(id: string, stopRequest: CnStopLabRequestDTO): Promise<CnLab> {
    const lab = await this.getAndCheckServerStatusBeforeAction(id, true);

    // if the user choose to back up the lab before stopping
    // we create a backup and add a green option to stop it after backup
    if (stopRequest.backupLabBefore) {
      await this.labServerService.checkBeforeStopLab(lab);
      await this.backupService.createProdBackup(lab);
      await this.labGreenOptionService.createStopAfterBackup(lab);
      return lab;
    } else {
      return this.labServerService.stopLab(lab);
    }
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

  async stopCurrentServerTask(labId: string): Promise<CnLabStatusDTO> {
    let lab: CnLab = await this.getAndCheckAuthorizationToManageLab(labId);

    if (lab.serverTaskStatus !== CnLabServerTaskStatus.RUNNING) {
      throw new BlBadRequestException('No task running');
    }

    lab = await this.labsService.updateServerTask(
      lab.id,
      `Last task stopped manually: ${lab.serverTaskText}`,
      CnLabServerTaskStatus.ERROR
    );
    return this.getStatus(lab);
  }

  ////////////////////////// STATUS RULES  //////////////////////////////

  public async createGreenOption(
    labId: string,
    greenOption: CnLabGreenOptionFormDto
  ): Promise<CnLabGreenOption> {
    const lab = await this.getAndCheckAuthorizationToManageLab(labId);
    return this.labGreenOptionService.createFromDTO(greenOption, lab);
  }

  public async updateGreenOption(
    greenOptionId: string,
    greenOption: CnLabGreenOptionFormDto
  ): Promise<CnLabGreenOption> {
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

  ////////////////////////// STATS //////////////////////////////

  public async getLabRunningStats(
    labId: string,
    request: CnLabStatsRequestDTO
  ): Promise<CnLabStatsRunningResponseDTO> {
    const lab = await this.getAndCheckAuthorizationToFindById(labId);
    return this.labStatsAggregateService.getLabRunningStats(lab, request);
  }

  public async getLabStorageStats(
    labId: string,
    request: CnLabStatsRequestDTO
  ): Promise<CnLabStatsStorageResponseDTO> {
    const lab = await this.getAndCheckAuthorizationToFindById(labId);
    return this.labStatsAggregateService.getLabStorageStats(lab, request);
  }

  ////////////////////////// DESKTOP //////////////////////////////
  public async generateDesktopConfig(
    labId: string,
    customConfig: CnLabDesktopGenerateConfig
  ): Promise<CnLabManagerInitConfig> {
    const lab = await this.getAndCheckAuthorizationToFindById(labId);

    return this.labDesktopService.generateLabManagerConfig(lab, customConfig);
  }

  public async getDesktopRunLabManagerCommand(labId: string): Promise<string> {
    const lab = await this.getAndCheckAuthorizationToFindById(labId);

    return this.labDesktopService.getCreateAndRunLabManagerCommand(lab);
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
      desktopPlatform: updateLab.desktopPlatform,
    });
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

    return this.dataSource.transaction(async (entityManager) => {
      const labDb = await this.labsService.createLab(lab, entityManager);

      // add the user as OWNER of his lab
      await this.labUserService.createLabUser(lab, userInfo.user, CnLabUserRole.OWNER, entityManager);
      return labDb;
    });
  }

  //////////////////////////// AUTHORIZATION ////////////////////////////////
  public async getAndCheckAuthorizationToFindById(id: string): Promise<CnLabWithSpace> {
    const lab = await this.labsService.findByIdAndCheck(id, { space: true });
    await this.security.checkAuthorizationToFindById(lab, CnCurrentUserHelper.getAndCheckUserSpaceInfo());
    return lab;
  }

  private async getAndCheckAuthorizationToUpdateAdmin(id: string): Promise<CnLabWithSpace> {
    const lab = await this.labsService.findByIdAndCheckWithSpace(id);
    this.security.checkAuthorizationToUpdateAdmin(lab, CnCurrentUserHelper.getAndCheckUserSpaceInfo());
    return lab;
  }

  public async getAndCheckAuthorizationToManageLab(
    id: string,
    refuseDesktop: boolean = true
  ): Promise<CnLabWithSpace> {
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
  private async getAndCheckServerStatusBeforeAction(
    id: string,
    requiresCloudLab: boolean = false
  ): Promise<CnLabWithSpace> {
    await this.refreshLabStatus(id);

    const lab = await this.getAndCheckAuthorizationToManageLab(id, true);

    if (requiresCloudLab && !lab.isCloud()) {
      throw new BlBadRequestException('This action is only available for cloud lab');
    }

    if (lab.serverIsBusy()) {
      throw new BlBadRequestException(`Server is ${lab.currentStatus.status} and cannot configured`);
    }

    if (lab.serverTaskIsRunning()) {
      throw new BlBadRequestException(
        `The task '${lab.serverTaskText}' is running on the lab, it can't be configured`
      );
    }

    // if the lab is not running, no need to check if a scenario is running
    if (!lab.isRunning()) return lab;

    await this.labServerService.checkLabActivity(lab);

    return lab;
  }

  private checkServerIsRunning(lab: CnLab): void {
    if (lab.serverIsStopped()) {
      throw new BlBadRequestException('Server is stopped, please start the server first');
    }
  }

  public async createGlabDevApiKey(): Promise<void> {
    if (!CnCurrentUserHelper.isAdmin()) {
      throw new BlUnauthorizedException();
    }

    return this.labsService.createGlabDevApiKey();
  }
}
