import {Injectable, Logger} from '@nestjs/common';
import {CnLabInstance} from './cn-lab-instance.entity';
import {CnLabInstancesService} from './cn-lab-instances.service';
import {CnLabInstanceStatusHistory} from './status/cn-lab-instance-status-history.entity';
import {CnErrorText} from '../cn-core/model/config/cn-error-text.class';
import {
  CnExternalLabBackup,
  CnExternalLabBackupHistory,
  CnExternalLabUser,
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
  CnLabInstanceStartDTO
} from './cn-lab-instance.dto';
import {CnLabConfig} from '../cn-lab-configs/cn-lab-config.entity';
import {CnLabInstancesSecurity} from './cn-lab-instances.security';
import {BlBadRequestException, BlDtoHelper, BlSearchParams, BlUnauthorizedException} from '@monorepo/back-core-lib';
import {CnLabInstanceUser, CnLabInstanceUserRole} from './user/cn-lab-instance-user.entity';
import {CnExternalLabUserService} from '../cn-external-lab-api/cn-external-lab-user.service';
import {CnExternalLabApiService} from '../cn-external-lab-api/cn-external-lab-api.service';
import {CnExternalLabError} from '../cn-external-lab-api/model/cn-external-lab-error.class';
import {AxiosResponse} from 'axios';
import {CnLabInstanceUserService} from './user/cn-lab-instance-user.service';
import {DataSource} from 'typeorm';
import {CnLabInstanceProject} from './project/cn-lab-instance-project.entity';
import {CnLabInstanceProjectService} from './project/cn-lab-instance-project.service';
import {CnProjectAggregateService} from '../cn-projects-aggregate/cn-project-aggregate.service';
import {CnExternalLabProjectService} from '../cn-external-lab-api/cn-external-lab-project.service';
import {CnUsersService} from '../cn-users/cn-users.service';
import {CnProject} from '../cn-projects-aggregate/cn-projects/cn-project.entity';
import {CnObjectStoragesAggregateService} from '../cn-object-storages/cn-object-storages-aggregate.service';


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
              private objectStorageService: CnObjectStoragesAggregateService) {
  }

  async create(createLabInstance: CnLabInstanceCreateDTO): Promise<CnLabInstance> {
    await this.security.checkAuthorizationToCreate(CnCurrentUserHelper.getAndCheckUserSpaceInfo());

    const labInstance = BlDtoHelper.fromDto(CnLabInstance, createLabInstance);

    return this.labInstancesService.create(labInstance);
  }


  async update(updateLabInstance: CnLabInstanceCreateDTO): Promise<CnLabInstance> {
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

  async startInstance(id: string): Promise<CnLabInstance> {
    await this.getAndCheckAuthorizationToFindById(id);

    return this.labInstancesService.startInstance(id);
  }

  async stopInstance(id: string): Promise<CnLabInstance> {
    await this.getAndCheckAuthorizationToFindById(id);

    return this.labInstancesService.stopInstance(id);
  }


  async getStatusHistory(id: string): Promise<CnLabInstanceStatusHistory[]> {
    // check that the user can get experiment
    await this.getAndCheckAuthorizationToFindById(id);

    return await this.labInstancesService.getStatusHistory(id) as CnLabInstanceStatusHistory[];
  }

  public async updateName(labInstanceId: string, name: string): Promise<CnLabInstance> {
    await this.getAndCheckAuthorizationToFindById(labInstanceId);

    return this.labInstancesService.updateName(labInstanceId, name);
  }

  public async getLabInstanceConfig(labInstanceId: string): Promise<CnLabConfig> {
    await this.getAndCheckAuthorizationToFindById(labInstanceId);

    return this.labInstancesService.getLabConfig(labInstanceId);
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

  /////////////////////////////////////// EXTERNAL LAB SERVICE //////////////////////////////////

  async login(id: string): Promise<CnLabInstanceToken> {
    const labInstance: CnLabInstance = await this.getAndCheckAuthorizationToFindById(id);

    // check that the lab is running
    if (!labInstance.isRunning()) {
      throw new BlBadRequestException(CnErrorText.LAB_STOPPED);
    }

    try {
      const token =
        await this.externalLabUserService.generateTempAccess(labInstance.getGlabApiInfo(),
          CnCurrentUserHelper.getAndCheckCurrentUser(), labInstance.space);

      return new CnLabInstanceToken(labInstance, token.temp_token);
    } catch (e: any) {
      const error: CnExternalLabError = (e.response as AxiosResponse)?.data ?? '';

      switch (error.code) {
        case 'gws_core.WRONG_CREDENTIALS_USER_NOT_ACTIVATED' :
          throw new BlUnauthorizedException(CnErrorText.LAB_USER_NOT_ACTIVATED);
        case 'gws_core.WRONG_CREDENTIALS_USER_NOT_FOUND' :
          throw new BlUnauthorizedException(CnErrorText.LAB_USER_NOT_FOUND);
        default:
          this.logger.error(e);
          throw new BlBadRequestException(CnErrorText.LAB_AUTH_ERROR);
      }
    }
  }


  public async checkStatus(labInstanceId: string): Promise<CnExternalLabUser[]> {
    const lab: CnLabInstance = await this.getAndCheckAuthorizationToFindById(labInstanceId);

    try {
      await this.externalLabApiService.healthCheck(lab.getGlabApiInfo());
    } catch {
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

      // add the user to the lab
      const externalRole: CnExternalLabUserRole = role === CnLabInstanceUserRole.OWNER ? 'ADMIN' : 'USER';
      await this.externalLabUserService.addUser(labInstance.getGlabApiInfo(), user, externalRole);

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

  public async getStatus(labId: string): Promise<CnLabManagerStatus> {
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

  public async updateConfig(labId: string, config: CnLabInstanceConfigDTO): Promise<void> {
    const labInstance: CnLabInstance = await this.getAndCheckAuthorizationToManageLab(labId);
    return this.labManagerService.updateConfig(labInstance, config);
  }

  public async getConfig(labId: string): Promise<CnLabInstanceConfigDTO> {
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
  public async markLabAsStarted(labStart: CnLabInstanceStartDTO): Promise<void> {
    await this.labInstancesService.markLabAsStarted(labStart);
  }

  public async getCurrentLabInstanceProjects(): Promise<CnProject[]> {
    const labProjects = await this.labInstanceProjectService.findByLabInstanceId(CnCurrentUserHelper.getAndCheckCurrentLabInstance().id);
    return labProjects.map(labProject => labProject.project);
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
