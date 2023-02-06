import {BadRequestException, Injectable, Logger} from '@nestjs/common';
import {CnLabInstance} from './cn-lab-instance.entity';
import {CnLabInstancesService} from './cn-lab-instances.service';
import {CnLabInstanceStatusHistory} from './status/cn-lab-instance-status-history.entity';
import {CnErrorText} from '../cn-core/model/config/cn-error-text.class';
import {
  CnExternalLabBackup,
  CnExternalLabBackupHistory,
  CnExternalLabUserRole
} from '../cn-external-lab-api/model/cn-external-lab-api.class';
import {ClPage, ClPageI} from '@monorepo/core-lib';
import {CnCurrentUserHelper} from '../cn-core/utils/cn-current-user.helper';
import {
  CnLabComposeUpOptions,
  CnLabDockerPs,
  CnLabManagerStatus
} from '../cn-external-lab-api/model/cn-lab-manager.class';
import {CnLabManagerService} from './cn-lab-manager.service';
import {CnLabInstanceToken} from './user/cn-lab-instance-token.class';
import {
  CnLabFindOneDto,
  CnLabInstanceConfigDTO,
  CnLabInstanceCreateDTO,
  CnLabInstanceStartDTO,
  CnLabInstanceStatusDTO
} from './cn-lab-instance.dto';
import {CnLabConfig} from '../cn-lab-configs/cn-lab-config.entity';
import {CnLabInstancesSecurity} from './cn-lab-instances.security';
import {
  BlBadRequestException,
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
import {CnLabSshService} from './server/cn-lab-ssh.service';
import {CnUser} from '../cn-users/cn-user.entity';
import {CnLabConfigsService} from '../cn-lab-configs/cn-lab-configs.service';


@Injectable()
export class CnLabInstanceAggregateService {

  private readonly logger = new Logger(CnLabInstanceAggregateService.name);


  constructor(private labInstancesService: CnLabInstancesService,
              private labInstanceGroupService: CnLabInstanceUserService,
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
              private labSshService: CnLabSshService,
              private labConfigService: CnLabConfigsService) {
  }

  async create(createLabInstance: CnLabInstanceCreateDTO): Promise<CnLabInstance> {
    if (createLabInstance.region.cloudProvider.id !== createLabInstance.serverInfo.cloudProvider.id) {
      throw new BlBadRequestException('Cloud Provider and Region must be the same');
    }

    await this.security.checkAuthorizationToCreate(CnCurrentUserHelper.getAndCheckUserSpaceInfo());

    const labInstance = BlDtoHelper.fromDto(CnLabInstance, createLabInstance);

    return this.labInstancesService.create(labInstance);
  }


  async update(updateLabInstance: CnLabInstanceCreateDTO): Promise<CnLabInstance> {
    if (updateLabInstance.region.cloudProvider.id !== updateLabInstance.serverInfo.cloudProvider.id) {
      throw new BlBadRequestException('Cloud Provider and Region must be the same');
    }

    const labInstanceDb: CnLabInstance = await this.getAndCheckAuthorizationToUpdate(updateLabInstance.id);
    const labInstance = BlDtoHelper.fromDto(CnLabInstance, updateLabInstance);
    return this.labInstancesService.updateWithCompare(labInstance, labInstanceDb);
  }

  async delete(id: string): Promise<void> {
    await this.getAndCheckAuthorizationToUpdate(id);
    await this.labInstancesService.deleteById(id);
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

  public async updateName(labInstanceId: string, name: string): Promise<CnLabInstance> {
    await this.getAndCheckAuthorizationToFindById(labInstanceId);

    return this.labInstancesService.updateName(labInstanceId, name);
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
    await this.getAndCheckAuthorizationToFindById(id);

    const labInstance = await this.labInstancesService.findByIdAndCheck(id, {
      labConfig: {brickVersions: {brick: true}}
    });

    if (!labInstance.labConfig) {
      throw new BadRequestException('Lab config not found');
    }

    return labInstance.labConfig;
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

    return Promise.all(promises).then(([labManagerStatus, glabStatus]) =>
      ({
        labStatus: labInstance.currentStatus.status,
        labManagerIsRunning: labManagerStatus,
        labIsRunning: glabStatus,
        hasServerInstanceId: !!labInstance.serverInstanceId,
        hasServerVolumeId: !!labInstance.serverVolumeId,
        serverProgressText: labInstance.serverProgressText,
      }));


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
      const instanceToken = this.addUserAndConnect(labInstance, CnCurrentUserHelper.getAndCheckCurrentUser());
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
    const group = await this.labInstanceGroupService.findByLabInstanceIdAndUserId(labInstance.id,
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
    const labInstance = await this.getAndCheckAuthorizationToManageLab(labInstanceId);
    const user = await this.usersService.findByIdAndCheck(userId);


    return await this.dataSource.transaction(async entityManager => {
      // create the relation between the group and the lab
      // use group if we share team latter
      const labInstanceGroup = await this.labInstanceGroupService.createLabInstanceGroup(labInstance, user, role, entityManager);

      // add the user to the lab is the lab is running
      const labIsRunning = await this.externalLabApiService.healthCheck(labInstance.getGlabApiInfo());
      if (labIsRunning) {
        const externalRole: CnExternalLabUserRole = role === CnLabInstanceUserRole.OWNER ? 'ADMIN' : 'USER';
        await this.externalLabUserService.addUser(labInstance.getGlabApiInfo(), user, externalRole);
      }

      return labInstanceGroup;
    });
  }

  public async updateUserLabRole(labInstanceId: string, groupId: string, role: CnLabInstanceUserRole): Promise<CnLabInstanceUser> {
    await this.getAndCheckAuthorizationToManageLab(labInstanceId);

    return this.labInstanceGroupService.updateLabInstanceGroupRole(labInstanceId, groupId, role);
  }

  public async removeUserFromLab(labInstanceId: string, userId: string): Promise<void> {
    const labInstance = await this.getAndCheckAuthorizationToManageLab(labInstanceId);

    return await this.dataSource.transaction(async entityManager => {
      await this.labInstanceGroupService.deleteLabInstanceGroup(labInstanceId, userId, entityManager);

      // deactivate the user in the lab
      await this.externalLabUserService.deactivateUser(labInstance.getGlabApiInfo(), userId);
    });
  }

  /**
   * Return the list of shared group for tha root project
   */
  public async getLabInstanceSharedUsers(labInstanceId: string): Promise<CnLabInstanceUser[]> {
    const labInstance = await this.getAndCheckAuthorizationToFindById(labInstanceId);

    return this.labInstanceGroupService.findByLabInstanceId(labInstance.id);
  }


  //////////////////////////// PROJECT ////////////////////////////////

  public async addProjectInLab(labInstanceId: string, projectId: string): Promise<CnLabInstanceProject> {
    // get and check if the user can manage the lab
    const labInstance = await this.getAndCheckAuthorizationToManageLab(labInstanceId);
    // get and check if the user can see the project
    const projectTree = await this.projectAggregateService.getProjectTree(projectId);

    return await this.dataSource.transaction(async entityManager => {

      const labProject = await this.labInstanceProjectService.createLabInstanceProject(labInstance, projectTree, entityManager);

      // add the project to the lab
      await this.externalLabProjectService.addProjectInLab(labInstance.getGlabApiInfo(), projectTree);

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

  public async getLabManagerStatus(labId: string): Promise<CnLabManagerStatus> {
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
    const labInstance: CnLabInstance = await this.getAndCheckAuthorizationToManageLab(labId);
    return this.labManagerService.initAll(labInstance, labInstance.space);
  }

  public async upContainers(labId: string, options?: CnLabComposeUpOptions): Promise<void> {
    const labInstance: CnLabInstance = await this.getAndCheckAuthorizationToManageLab(labId);
    return this.labManagerService.upContainers(labInstance, options);
  }

  public async restartContainers(labId: string, options?: CnLabComposeUpOptions): Promise<void> {
    const labInstance: CnLabInstance = await this.getAndCheckAuthorizationToManageLab(labId);
    return this.labManagerService.restartContainers(labInstance, options);
  }

  public async downContainers(labId: string): Promise<void> {
    const labInstance: CnLabInstance = await this.getAndCheckAuthorizationToManageLab(labId);
    return this.labManagerService.downContainers(labInstance);
  }

  public async pullContainers(labId: string): Promise<void> {
    const labInstance: CnLabInstance = await this.getAndCheckAuthorizationToManageLab(labId);
    return this.labManagerService.pullContainers(labInstance);
  }

  public async pullBiota(labId: string): Promise<void> {
    const labInstance: CnLabInstance = await this.getAndCheckAuthorizationToManageLab(labId);
    return this.labManagerService.pullBiota(labInstance);
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

  public async updateLabManagerConfig(labId: string, config: CnLabInstanceConfigDTO): Promise<void> {
    const labInstance: CnLabInstance = await this.getAndCheckAuthorizationToManageLab(labId);
    return this.labManagerService.updateConfig(labInstance, config);
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

  /////////////////////////// BACKUP ////////////////////////////////

  public async createProdBackup(labId: string): Promise<CnExternalLabBackup> {
    const labInstance: CnLabInstance = await this.getAndCheckAuthorizationToManageLab(labId);

    // get or create the bucket associated with this lab instance
    const bucket = await this.objectStorageService.getOrCreateLabBackupBucket(labInstance);

    return this.labManagerService.createProdBackup(labInstance, bucket.getBucketConfig());
  }

  public async stopCurrentBackup(labId: string): Promise<boolean> {
    const labInstance: CnLabInstance = await this.getAndCheckAuthorizationToManageLab(labId);
    return this.labManagerService.stopCurrentBackup(labInstance);
  }


  public async getBackupCurrentStatus(labId: string): Promise<CnExternalLabBackup> {
    const labInstance: CnLabInstance = await this.getAndCheckAuthorizationToManageLab(labId);
    return this.labManagerService.getBackupCurrentStatus(labInstance);
  }

  public async getBackupHistory(labId: string): Promise<CnExternalLabBackupHistory> {
    const labInstance: CnLabInstance = await this.getAndCheckAuthorizationToManageLab(labId);
    return this.labManagerService.getBackupHistory(labInstance);
  }

  /////////////////////////// EXTERNAL LAB //////////////////////////////
  public async registerLabConfig(labStart: CnLabInstanceStartDTO): Promise<void> {
    const labConfig = await this.labConfigService.getOrCreateLabConfig(labStart.lab_config);

    const labInstance = CnCurrentUserHelper.getAndCheckCurrentLabInstance();

    labInstance.labConfig = labConfig;
    await this.labInstancesService.update(labInstance);
  }

  public async getCurrentLabInstanceProjects(): Promise<CnProject[]> {
    const labProjects = await this.labInstanceProjectService.findByLabInstanceId(CnCurrentUserHelper.getAndCheckCurrentLabInstance().id);
    return labProjects.map(labProject => labProject.project);
  }


  /////////////////////////// SERVER //////////////////////////////

  public async getServerInfo(labInstanceId: string): Promise<CnCpCompleteInfo> {
    const labInstance = await this.getAndCheckAuthorizationToManageLab(labInstanceId);
    return this.labServerService.getCompleteInfo(labInstance);
  }

  public async initServer(labInstanceId: string): Promise<CnLabInstanceStatusDTO> {
    let labInstance = await this.checkServerStatusBeforeAction(labInstanceId);

    labInstance = await this.labInstancesService.markInstanceAsStarting(labInstance.id);

    // call the init async (return the server response immediately)
    this.initServerAsync(labInstance).catch(
      // if an error occurred we just refresh the lab status
      (error: Error) => {
        this.logger.error(`Error during initServer: ${error.message}`);
        this.labServerService.refreshLabStatus(labInstance.id).catch(err => this.logger.error(err));
      }
    );

    return this.getStatus(labInstance);
  }

  private async initServerAsync(labInstance: CnLabInstance): Promise<void> {

    labInstance = await this.createServerAsync(labInstance, false);

    // wait for the DNS to be ready
    await this.labSshService.waitForSshConnection(labInstance);

    await this.configureServerAsync(labInstance, false);

    await this.refreshStatusAndServerText(labInstance.id);
  }

  public async createServer(labInstanceId: string): Promise<CnLabInstanceStatusDTO> {
    let labInstance = await this.checkServerStatusBeforeAction(labInstanceId);

    labInstance = await this.labInstancesService.markInstanceAsStarting(labInstance.id);

    // call the init async (return the server response immediately)
    this.createServerAsync(labInstance, true).catch(
      // if an error occurred we just refresh the lab status
      (error: Error) => {
        this.logger.error(`Error during createServer: ${error.message}`);
        this.labServerService.refreshLabStatus(labInstance.id).catch(err => this.logger.error(err));
      }
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
    let labInstance = await this.checkServerStatusBeforeAction(labInstanceId);

    const sshTest = await this.labSshService.checkSshConnection(labInstance.virtualHost);
    if (!sshTest) {
      throw new BadRequestException(`SSH connection to ${labInstance.virtualHost} failed`);
    }

    labInstance = await this.labInstancesService.markInstanceAsStarting(labInstance.id);

    // call the init async (return the server response immediately)
    this.configureServerAsync(labInstance, true).catch(
      // if an error occurred we just refresh the lab status
      (error: Error) => {
        this.logger.error(`Error during configureServerAsync: ${error.message}`);
        this.labServerService.refreshLabStatus(labInstance.id).catch(err => this.logger.error(err));
      }
    );

    return this.getStatus(labInstance);
  }

  public async configureServerAsync(labInstance: CnLabInstance, refreshStatus: boolean): Promise<CnLabInstance> {
    labInstance = await this.labSshService.configureServer(labInstance);

    if (refreshStatus) {
      labInstance = await this.refreshStatusAndServerText(labInstance.id);
    }
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

    return this.labInstancesService.updateServerStatusText(labInstanceId, text);
  }

  public async deleteServerInstance(labInstanceId: string): Promise<void> {
    const labInstance = await this.checkServerStatusBeforeAction(labInstanceId);

    this.security.checkAuthorizationToDeleteServer(CnCurrentUserHelper.getAndCheckUserSpaceInfo());
    await this.labServerService.deleteLabInstanceServerAndVolume(labInstance);
  }

  async startInstance(id: string): Promise<CnLabInstance> {
    const labInstance = await this.checkServerStatusBeforeAction(id);

    return this.labServerService.startLab(labInstance);
  }

  async stopInstance(id: string): Promise<CnLabInstance> {
    const labInstance = await this.checkServerStatusBeforeAction(id);

    return this.labServerService.stopLab(labInstance);
  }

  async updateLabManager(labInstanceId: string): Promise<CnLabInstanceStatusDTO> {
    const labInstance = await this.checkServerStatusBeforeAction(labInstanceId);

    await this.labSshService.updateLabManager(labInstance);
    return this.getStatus(labInstance);
  }

  async updateDockerlab(labInstanceId: string): Promise<CnLabInstanceStatusDTO> {
    const labInstance = await this.checkServerStatusBeforeAction(labInstanceId);

    await this.labSshService.updateDockerlabRepo(labInstance);
    return this.getStatus(labInstance);
  }

  /**
   * Before any action on the server, refresh the lab instance status and
   * check that the server is in a state where it can be managed
   * @param id
   * @private
   */
  private async checkServerStatusBeforeAction(id: string): Promise<CnLabInstance> {
    // check authorization
    let labInstance = await this.getAndCheckAuthorizationToManageLab(id);
    labInstance = await this.labServerService.refreshLabStatus(labInstance.id);

    if (labInstance.serverIsBusy()) {
      throw new BadRequestException(`Server is ${labInstance.currentStatus.status} and cannot configured`);
    }
    return labInstance;
  }

  //////////////////////////// AUTHORIZATION ////////////////////////////////
  private async getAndCheckAuthorizationToFindById(id: string): Promise<CnLabInstance> {
    const labInstance = await this.labInstancesService.findByIdAndCheck(id, {space: true});
    await this.security.checkAuthorizationToFindById(labInstance, CnCurrentUserHelper.getAndCheckUserSpaceInfo());
    return labInstance;
  }


  private async getAndCheckAuthorizationToUpdate(id: string): Promise<CnLabInstance> {
    const labInstance = await this.labInstancesService.findByIdAndCheck(id, {sharedGroups: true, space: true});
    this.security.checkAuthorizationToUpdate(labInstance, CnCurrentUserHelper.getAndCheckUserSpaceInfo());
    return labInstance;
  }

  private async getAndCheckAuthorizationToManageLab(id: string): Promise<CnLabInstance> {
    const labInstance = await this.labInstancesService.findByIdAndCheck(id, {sharedGroups: true, space: true});
    await this.security.checkAuthorizationToManageLab(labInstance, CnCurrentUserHelper.getAndCheckUserSpaceInfo());
    return labInstance;
  }


}
