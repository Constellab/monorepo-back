import {Injectable, Logger} from '@nestjs/common';
import {CnLabInstance, CnLabInstanceType} from './cn-lab-instance.entity';
import {CnLabInstancesService} from './cn-lab-instances.service';
import {CnLabInstanceStatusHistory} from './status/cn-lab-instance-status-history.entity';
import {CnErrorText} from '../cn-core/model/config/cn-error-text.class';
import {
  CnExternalLabBackup,
  CnExternalLabBackupHistory,
  CnExternalLabBackupInfoDto,
  CnExternalLabUser,
  CnExternalLabUserRole
} from '../cn-external-lab-api/model/cn-external-lab-api.class';
import {ClPage, ClPageI} from '@monorepo/core-lib';
import {CnCurrentUserHelper} from '../cn-core/utils/cn-current-user.helper';
import {
  CnLabComposeRestartOptions,
  CnLabComposeUpOptions,
  CnLabDockerPs,
  CnLabPullBiotaOptions
} from '../cn-external-lab-api/model/cn-lab-manager.class';
import {CnLabManagerService} from './cn-lab-manager.service';
import {CnLabInstanceToken} from './user/cn-lab-instance-token.class';
import {
  CnLabFindOneDto,
  CnLabInstanceConfigDTO,
  CnLabInstanceCreateAdminDTO,
  CnLabInstanceCreateDesktopDTO,
  CnLabInstanceDesktopConfig,
  CnLabInstanceStartDTO,
  CnLabInstanceStatusDTO,
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
import {DataSource} from 'typeorm';
import {CnLabInstanceProject} from './project/cn-lab-instance-project.entity';
import {CnLabInstanceProjectService} from './project/cn-lab-instance-project.service';
import {CnProjectAggregateService} from '../cn-projects-aggregate/cn-project-aggregate.service';
import {CnExternalLabProjectService} from '../cn-external-lab-api/cn-external-lab-project.service';
import {CnUsersService} from '../cn-users/cn-users.service';
import {CnProject} from '../cn-projects-aggregate/cn-projects/cn-project.entity';
import {CnObjectStoragesAggregateService} from '../cn-object-storages/cn-object-storages-aggregate.service';
import {CnCpCompleteInfo} from './server/cn-cloud-provider.class';
import {CnLabServerService} from './server/cn-lab-server.service';
import {CnLabConfigurerService} from './server/cn-lab-configurer.service';
import {CnUser} from '../cn-users/cn-user.entity';
import {CnLabConfigsService} from '../cn-lab-configs/cn-lab-configs.service';
import {CnLabDesktopConfig, CnLabInstanceDesktopService} from './desktop/cn-lab-instance-desktop.service';
import {CnBrickGWS} from '../cn-bricks/cn-brick.dto';
import {CnLabInstanceMailService} from './mail/cn-lab-instance-mail.service';
import {CnLabSshService} from './server/cn-lab-ssh.service';
import {CnLabGreenOption} from './green-option/cn-lab-green-option.entity';
import {CnLabGreenOptionService} from './green-option/cn-lab-green-option.service';
import {CnLabGreenOptionFormDto} from './green-option/cn-lab-green-option.dto';
import {CnAuthService, CnExternalCheckCredentialResponse} from '../cn-auth/cn-auth.service';
import {CnLabInstanceServerTaskStatus} from './status/cn-lab-instance-status.enum';


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
              private objectStorageService: CnObjectStoragesAggregateService,
              private labServerService: CnLabServerService,
              private labConfigurerService: CnLabConfigurerService,
              private labSshService: CnLabSshService,
              private labConfigService: CnLabConfigsService,
              private labInstanceDesktopService: CnLabInstanceDesktopService,
              private labMailService: CnLabInstanceMailService,
              private labGreenOptionService: CnLabGreenOptionService,
              private authService: CnAuthService) {
  }

  /**
   * Create a lab instance with all information (only for admin)
   */
  async createAdmin(createLabInstance: CnLabInstanceCreateAdminDTO): Promise<CnLabInstance> {
    const labInstance = BlDtoHelper.fromDto(CnLabInstance, createLabInstance);

    const userInfo = CnCurrentUserHelper.getAndCheckUserSpaceInfo();
    await this.security.checkAuthorizationToCreateAdmin(labInstance, userInfo);

    return this.labInstancesService.create(labInstance);
  }

  /**
   * Update a lab instance with all information (only for admin)
   */
  async updateAdmin(updateLabInstance: CnLabInstanceCreateAdminDTO): Promise<CnLabInstance> {
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

    await this.security.checkAuthorizationCreateDesktopLabInstance(labInstance);

    return this.dataSource.transaction(async entityManager => {
      const labInstanceDb = await this.labInstancesService.create(labInstance, entityManager);

      // add the user as OWNER of his lab
      await this.labInstanceUserService.createLabInstanceUser(labInstance, userInfo.user, CnLabInstanceUserRole.OWNER, entityManager);
      return labInstanceDb;
    });
  }

  /**
   * Update accessible for any owner of the lab, he can update only few parameters
   * @param updateLabInstance
   */
  async updateLab(updateLabInstance: CnLabInstanceCreateDesktopDTO): Promise<CnLabInstance> {
    const labInstanceDb: CnLabInstance = await this.labInstancesService.findByIdAndCheck(updateLabInstance.id);
    labInstanceDb.name = updateLabInstance.name;

    if (updateLabInstance.desktopPlatform && labInstanceDb.isDesktop()) {
      labInstanceDb.desktopPlatform = updateLabInstance.desktopPlatform;
    }

    await this.security.checkAuthorizationToManageLab(labInstanceDb, CnCurrentUserHelper.getAndCheckUserSpaceInfo());

    return this.labInstancesService.update(labInstanceDb);
  }

  async delete(id: string): Promise<void> {
    await this.getAndCheckAuthorizationToUpdateAdmin(id);
    await this.labInstancesService.deleteById(id);
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
    await this.security.checkAuthorizationToFindAllBySpace(CnCurrentUserHelper.getAndCheckUserSpaceInfo());
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
    await this.security.checkAuthorizationToFindAll(CnCurrentUserHelper.getAndCheckUserSpaceInfo());

    return this.labInstancesService.searchAll(searchParams, page, size);
  }

  async searchInCurrentSpace(searchParams: BlSearchParams, page: number, size: number): Promise<ClPage<CnLabInstance>> {
    await this.security.checkAuthorizationToFindAllBySpace(CnCurrentUserHelper.getAndCheckUserSpaceInfo());

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

    if (labInstance.isCloud()) {
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
    labInstance.labConfig = labConfig;
    return this.labInstancesService.update(labInstance);
  }

  /////////////////////////////////////// STATUS  //////////////////////////////////

  public async getLabStatus(id: string): Promise<CnLabInstanceStatusDTO> {
    const labInstance = await this.getAndCheckAuthorizationToFindById(id);
    return this.getStatus(labInstance);
  }

  private async getStatus(labInstance: CnLabInstance): Promise<CnLabInstanceStatusDTO> {
    const promises: [Promise<boolean>, Promise<boolean>] = [
      this.labManagerService.healthCheck(labInstance.getLabManagerApiInfo().apiUrl),
      this.externalLabApiService.healthCheck(labInstance.getGlabApiInfo())
    ];

    return Promise.all(promises).then(([labManagerStatus, glabStatus]) => {
      const labStatus = new CnLabInstanceStatusDTO();
      labStatus.labStatus = labInstance.currentStatus.status;
      labStatus.labManagerIsRunning = labManagerStatus;
      labStatus.labIsRunning = glabStatus;
      labStatus.hasServerInstanceId = !!labInstance.serverInstanceId;
      labStatus.hasServerVolumeId = !!labInstance.serverVolumeId;
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
  async refreshStatus(id: string): Promise<CnLabInstanceStatusDTO> {
    let labInstance = await this.getAndCheckAuthorizationToFindById(id);

    labInstance = await this.labServerService.refreshLabStatus(labInstance.id);
    return this.getStatus(labInstance);
  }

  /////////////////////////////////////// EXTERNAL LAB SERVICE //////////////////////////////////

  async login(id: string): Promise<CnLabInstanceToken> {
    const labInstance: CnLabInstance = await this.getAndCheckAuthorizationToFindById(id);

    if (labInstance.isDesktop()) {
      throw new BlBadRequestException(CnErrorText.CANT_MANAGE_DESKTOP_LAB);
    }

    // check that the lab is running
    if (!labInstance.isRunning()) {
      throw new BlBadRequestException(CnErrorText.LAB_STOPPED);
    }

    const user = CnCurrentUserHelper.getAndCheckCurrentUser();
    try {
      const token =
        await this.externalLabUserService.generateTempAccess(labInstance.getGlabApiInfo(),
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
      await this.externalLabUserService.addUser(labInstance.getGlabApiInfo(), user, externalRole);

      const token =
        await this.externalLabUserService.generateTempAccess(labInstance.getGlabApiInfo(),
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

    const isRunning = await this.externalLabApiService.healthCheck(lab.getGlabApiInfo());
    this.logger.log('Lab ' + labInstanceId + ' is running : ' + isRunning);
    if (!isRunning) {
      throw new BlBadRequestException('The lab is not running');
    }

    try {
      return await this.externalLabApiService.getSettings(lab.getGlabApiInfo());
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

      if (labInstance.isCloud()) {
        // add the user to the lab is the lab is running
        const labIsRunning = await this.externalLabApiService.healthCheck(labInstance.getGlabApiInfo());
        if (labIsRunning) {
          const externalRole: CnExternalLabUserRole = role === CnLabInstanceUserRole.OWNER ? 'ADMIN' : 'USER';
          await this.externalLabUserService.addUser(labInstance.getGlabApiInfo(), user, externalRole);
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

      if (labInstance.isCloud()) {
        // add the user to the lab is the lab is running
        const labIsRunning = await this.externalLabApiService.healthCheck(labInstance.getGlabApiInfo());

        if (labIsRunning) {
          // deactivate the user in the lab
          await this.externalLabUserService.deactivateUser(labInstance.getGlabApiInfo(), userId);
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
    // get and check if the user can see the project
    const projectTree = await this.projectAggregateService.getProjectTree(projectId);

    return await this.dataSource.transaction(async entityManager => {

      const labProject = await this.labInstanceProjectService.createLabInstanceProject(labInstance, projectTree, entityManager);

      // add the user to the lab is the lab is running
      const labIsRunning = await this.externalLabApiService.healthCheck(labInstance.getGlabApiInfo());
      if (labIsRunning) {
        // add the project to the lab
        await this.externalLabProjectService.addProjectInLab(labInstance.getGlabApiInfo(), projectTree);
      }

      return labProject;
    });
  }

  public async removeProjectInLab(labInstanceId: string, projectId: string): Promise<void> {
    // get and check if the user can manage the lab
    const labInstance = await this.getAndCheckAuthorizationToManageLab(labInstanceId);

    return await this.dataSource.transaction(async entityManager => {
      await this.labInstanceProjectService.deleteLabInstanceProject(labInstanceId, projectId, entityManager);

      // remove the project from the lab
      await this.externalLabProjectService.deleteProjectInLab(labInstance.getGlabApiInfo(), projectId);
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

  public async listContainers(labId: string): Promise<CnLabDockerPs[]> {
    const labInstance: CnLabInstance = await this.getAndCheckAuthorizationToManageLab(labId);
    return this.labManagerService.listContainers(labInstance);
  }

  public async getLogs(labId: string, containerName: string): Promise<string> {
    const labInstance: CnLabInstance = await this.getAndCheckAuthorizationToManageLab(labId);
    return this.labManagerService.getLogs(labInstance, containerName);
  }

  public async initAll(labId: string): Promise<void> {
    const labInstance: CnLabInstance = await this.getAndCheckServerStatusBeforeAction(labId);
    return this.labManagerService.initAll(labInstance, labInstance.space.domain);
  }

  public async upContainers(labId: string, options?: CnLabComposeUpOptions): Promise<void> {
    const labInstance: CnLabInstance = await this.getAndCheckServerStatusBeforeAction(labId);
    return this.labManagerService.upContainers(labInstance, options);
  }

  public async restartContainers(labId: string, options?: CnLabComposeRestartOptions): Promise<void> {
    const labInstance: CnLabInstance = await this.getAndCheckServerStatusBeforeAction(labId);
    return this.labManagerService.restartContainers(labInstance, options);
  }

  public async downContainers(labId: string): Promise<void> {
    const labInstance: CnLabInstance = await this.getAndCheckServerStatusBeforeAction(labId);
    return this.labManagerService.downContainers(labInstance);
  }

  public async pullContainers(labId: string): Promise<void> {
    const labInstance: CnLabInstance = await this.getAndCheckAuthorizationToManageLab(labId);
    return this.labManagerService.pullContainers(labInstance);
  }

  public async pullBiota(labId: string, options: CnLabPullBiotaOptions): Promise<void> {
    const labInstance: CnLabInstance = await this.getAndCheckAuthorizationToManageLab(labId);
    return this.labManagerService.pullBiota(labInstance, options);
  }

  public async registryLogin(labId: string): Promise<void> {
    const labInstance: CnLabInstance = await this.getAndCheckAuthorizationToManageLab(labId);
    return this.labManagerService.registryLogin(labInstance);
  }

  public async stopCurrentTask(labId: string): Promise<void> {
    const labInstance: CnLabInstance = await this.getAndCheckAuthorizationToManageLab(labId);
    return this.labManagerService.stopCurrentTask(labInstance);
  }

  public async systemPrune(labId: string): Promise<void> {
    const labInstance: CnLabInstance = await this.getAndCheckAuthorizationToManageLab(labId);
    return this.labManagerService.systemPrune(labInstance);
  }

  public async getLabManagerConfig(labId: string): Promise<CnLabInstanceConfigDTO> {
    const labInstance: CnLabInstance = await this.getAndCheckAuthorizationToManageLab(labId);
    return this.labManagerService.getConfig(labInstance);
  }

  public async startAdminer(labId: string): Promise<boolean> {
    const labInstance: CnLabInstance = await this.getAndCheckAuthorizationToManageLab(labId);
    return this.labManagerService.startAdminer(labInstance);
  }

  public async stopAdminer(labId: string): Promise<boolean> {
    const labInstance: CnLabInstance = await this.getAndCheckAuthorizationToManageLab(labId);
    return this.labManagerService.stopAdminer(labInstance);
  }

  public getLabManagerRecommendedVersion(): string {
    return this.labManagerService.getLabManagerRecommendedVersion();
  }

  /////////////////////////// BACKUP ////////////////////////////////

  public async createProdBackup(labId: string): Promise<CnExternalLabBackup> {
    const labInstance: CnLabInstance = await this.getAndCheckAuthorizationToManageLab(labId);

    // get or create the bucket associated with this lab instance
    const backupInfo = await this.getLabBackupInfo(labInstance.id, labInstance.spaceId);

    return this.labManagerService.createProdBackup(labInstance, backupInfo);
  }

  public async stopCurrentBackup(labId: string): Promise<boolean> {
    const labInstance: CnLabInstance = await this.getAndCheckAuthorizationToManageLab(labId);
    return this.labManagerService.stopCurrentBackup(labInstance);
  }


  public async getBackupLastStatus(labId: string): Promise<CnExternalLabBackup> {
    const labInstance: CnLabInstance = await this.getAndCheckAuthorizationToManageLab(labId);
    return this.labManagerService.getBackupLastStatus(labInstance);
  }

  public async getBackupHistory(labId: string): Promise<CnExternalLabBackupHistory> {
    const labInstance: CnLabInstance = await this.getAndCheckAuthorizationToManageLab(labId);
    return this.labManagerService.getBackupHistory(labInstance);
  }

  private async getLabBackupInfo(labInstanceId: string, labInstanceSpaceId: string): Promise<CnExternalLabBackupInfoDto> {
    // get or create the bucket associated with this lab instance
    const bucket = await this.objectStorageService.getOrCreateLabBackupBucket(labInstanceId, labInstanceSpaceId);

    return {
      buckets: [bucket.getBucketConfig()],
    };
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
    // for desktop lab, no captcha is needed as this is local
    return this.authService.externalCheckCredentials(credentials, lab.isCloud() && !ignoreCaptcha, ignore2Fa);
  }

  /////////////////////////// EXTERNAL LAB MANAGER //////////////////////////////
  public async getCurrentLabInstanceBackupInfo(): Promise<CnExternalLabBackupInfoDto> {
    const labInstance = CnCurrentUserHelper.getAndCheckCurrentLabInstance();
    return this.getLabBackupInfo(labInstance.id, labInstance.spaceId);
  }

  /////////////////////////// SERVER //////////////////////////////

  public async getServerInfo(labInstanceId: string): Promise<CnCpCompleteInfo> {
    const labInstance = await this.getAndCheckAuthorizationToManageLab(labInstanceId);
    return this.labServerService.getCompleteInfo(labInstance);
  }

  public async initServer(labInstanceId: string): Promise<CnLabInstanceStatusDTO> {
    let labInstance = await this.getAndCheckServerStatusBeforeAction(labInstanceId);

    labInstance = await this.labInstancesService.markInstanceAsServerStarting(labInstance.id);

    // call the init async (return the server response immediately)
    this.initServerAsync(labInstance).catch(
      // if an error occurred we just refresh the lab status
      (error: Error) => this.onError(labInstance.id, `Error during server initialization : ${error.message}`)
    );

    return this.getStatus(labInstance);
  }

  private async initServerAsync(labInstance: CnLabInstance): Promise<void> {

    labInstance = await this.createServerAsync(labInstance, false);

    // wait for the DNS to be ready
    // wait for 2 consecutive success because DNS propagation can take some time
    await this.labSshService.waitForSshConnection(labInstance, 2);

    await this.configureServerAsync(labInstance, false);

    await this.refreshStatusAndServerText(labInstance.id);

    await this.configureAndStartLabBricksAfterInit(labInstance.id);
  }

  public async createServer(labInstanceId: string): Promise<CnLabInstanceStatusDTO> {
    let labInstance = await this.getAndCheckServerStatusBeforeAction(labInstanceId);

    labInstance = await this.labInstancesService.markInstanceAsServerStarting(labInstance.id);

    // call the init async (return the server response immediately)
    this.createServerAsync(labInstance, true).catch(
      // if an error occurred we just refresh the lab status
      (error: Error) => this.onError(labInstance.id, `Error during server creation: ${error.message}`)
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

    const sshTest = await this.labSshService.checkSshConnection(labInstance.virtualHost);
    if (!sshTest) {
      throw new BlBadRequestException(`SSH connection to ${labInstance.virtualHost} failed`);
    }

    labInstance = await this.labInstancesService.markInstanceAsServerStarting(labInstance.id);

    // call the init async (return the server response immediately)
    this.configureServerAsync(labInstance, true).catch(
      // if an error occurred we just refresh the lab status
      (error: Error) => this.onError(labInstance.id, `Error during server configuration: ${error.message}`)
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

  /**
   * Method called after the lab server init or lab start is done to start the lab if the lab is configured
   * If the lab manager is not configured but the lab has a configuration, it updates the lab manager config
   * @private
   */
  private async configureAndStartLabBricksAfterInit(id: string): Promise<CnLabInstance> {
    const labInstance = await this.labInstancesService.findByIdAndCheck(id, {space: true});

    await this.labManagerService.waitForHealthCheck(labInstance.getLabManagerApiInfo().apiUrl);


    // if the lab is already configured, we don't update its config
    const managerConfig = await this.labManagerService.getConfig(labInstance);
    if (managerConfig == null || managerConfig.brickVersions == null || managerConfig.brickVersions.length === 0) {

      // if the lab doesn't have a lab config, do nothing
      if (labInstance.labConfigId == null) return labInstance;

      // get the lab bricks config
      const labConfig = await this.labConfigService.getCompleteConfig(labInstance.labConfigId);

      const configDto = labConfig.toLabInstanceConfigDTO();
      await this.labManagerService.updateConfig(labInstance, configDto);
    }

    await this.labManagerService.initAll(labInstance, labInstance.space.domain);

    return labInstance;
  }

  private async refreshStatusAndServerText(labInstanceId: string): Promise<CnLabInstance> {
    const status = await this.refreshStatus(labInstanceId);
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

  private async onError(labInstanceId: string, message: string): Promise<void> {
    this.logger.error(message);
    await this.labInstancesService.updateServerTask(labInstanceId, message, CnLabInstanceServerTaskStatus.ERROR)
      .catch(err => this.logger.error(err));
    this.labServerService.refreshLabStatus(labInstanceId).catch(err => this.logger.error(err));
  }

  public async deleteServerInstance(labInstanceId: string): Promise<void> {
    const labInstance = await this.getAndCheckServerStatusBeforeAction(labInstanceId);

    this.security.checkAuthorizationToDeleteServer(CnCurrentUserHelper.getAndCheckUserSpaceInfo());
    await this.labServerService.deleteLabInstanceServerAndVolume(labInstance);
  }

  async startInstance(id: string): Promise<CnLabInstance> {
    let labInstance = await this.getAndCheckServerStatusBeforeAction(id);

    labInstance = await this.labServerService.startLab(labInstance);

    // start the lab if the lab is configured
    this.configureAndStartLabBricksAfterInit(labInstance.id).catch(
      // if an error occurred we just refresh the lab status
      (error: Error) => this.onError(labInstance.id, `Error during lab start : ${error.message}`)
    );

    return labInstance;
  }


  async stopInstance(id: string): Promise<CnLabInstance> {
    const labInstance = await this.getAndCheckServerStatusBeforeAction(id);

    return this.labServerService.stopLab(labInstance);
  }

  async updateLabManager(labInstanceId: string, labManagerVersion: string): Promise<CnLabInstanceStatusDTO> {
    const labInstance = await this.getAndCheckServerStatusBeforeAction(labInstanceId);

    await this.labConfigurerService.updateLabManager(labInstance, labManagerVersion);
    return this.getStatus(labInstance);
  }

  async updateDockerlab(labInstanceId: string): Promise<CnLabInstanceStatusDTO> {
    const labInstance = await this.getAndCheckServerStatusBeforeAction(labInstanceId);

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
  private async getAndCheckServerStatusBeforeAction(id: string): Promise<CnLabInstance> {
    await this.labServerService.refreshLabStatus(id);

    const labInstance = await this.getAndCheckAuthorizationToManageLab(id, true);

    if (labInstance.serverIsBusy()) {
      throw new BlBadRequestException(`Server is ${labInstance.currentStatus.status} and cannot configured`);
    }

    if (labInstance.serverTaskStatus === CnLabInstanceServerTaskStatus.RUNNING) {
      throw new BlBadRequestException('A task is running on the lab, it can\'t be configured');
    }

    // if the lab is not running, no need to check if an experiment is running
    if (!labInstance.isRunning()) return labInstance;

    await this.labServerService.checkLabActivity(labInstance);

    return labInstance;
  }


}
