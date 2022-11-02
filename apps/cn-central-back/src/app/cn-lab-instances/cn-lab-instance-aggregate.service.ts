import {BadRequestException, Injectable, Logger, UnauthorizedException} from '@nestjs/common';
import {CnLabInstance} from './cn-lab-instance.entity';
import {CnLabInstancesService} from './cn-lab-instances.service';
import {CnLabInstanceStatusHistory} from './cn-lab-instance-status-history.entity';
import {CnErrorText} from '../cn-core/model/config/cn-error-text.class';
import {CnExternalLabUser, CnExternalNewLabUser} from '../cn-external-lab-api/model/cn-external-lab-api.class';
import {ClPageI} from '@monorepo/core-lib';
import {CnCurrentUserHelper} from '../cn-core/utils/cn-current-user.helper';
import {
  CnLabComposeUpOptions,
  CnLabDockerPs,
  CnLabManagerStatus
} from '../cn-external-lab-api/model/cn-lab-manager.class';
import {CnLabManagerService} from './cn-lab-manager.service';
import {CnLabInstanceToken} from './cn-lab-instance-token.class';
import {CnLabFindOneDto, CnLabInstanceConfigDTO, CnLabInstanceCreateDTO} from './cn-lab-instance.dto';
import {CnLabConfig} from '../cn-lab-configs/cn-lab-config.entity';
import {CnLabInstancesSecurity} from './cn-lab-instances.security';
import {BlDtoHelper} from '@monorepo/back-core-lib';
import {CnLabInstanceGroup, CnLabInstanceGroupRole} from './cn-lab-instance-group.entity';
import {CnGroupsService} from '../cn-groups/cn-groups.service';
import {CnExternalLabUserService} from '../cn-external-lab-api/cn-external-lab-user.service';
import {CnExternalLabApiService} from '../cn-external-lab-api/cn-external-lab-api.service';
import {CnUser} from '../cn-users/cn-user.entity';
import {CnExternalLabError} from '../cn-external-lab-api/model/cn-external-lab-error.class';
import {AxiosResponse} from 'axios';
import {CnUsersService} from '../cn-users/cn-users.service';
import {CnGroupTeam} from '../cn-groups/cn-group.entity';
import {CnLabInstanceGroupService} from './cn-lab-instance-group.service';


@Injectable()
export class CnLabInstanceAggregateService {

  private readonly logger = new Logger(CnLabInstanceAggregateService.name);


  constructor(private labInstancesService: CnLabInstancesService,
              private labInstanceGroupService: CnLabInstanceGroupService,
              private labManagerService: CnLabManagerService,
              private security: CnLabInstancesSecurity,
              private groupService: CnGroupsService,
              private externalLabUserService: CnExternalLabUserService,
              private externalLabApiService: CnExternalLabApiService,
              private userService: CnUsersService) {
  }

  async create(createLabInstance: CnLabInstanceCreateDTO): Promise<CnLabInstance> {
    await this.security.checkAuthorizationToCreate(CnCurrentUserHelper.getAndCheckUserOrgaInfo());

    const labInstance = BlDtoHelper.fromDto(CnLabInstance, createLabInstance);

    // create the shared group for the owner
    const labInstanceGroup = new CnLabInstanceGroup();
    labInstanceGroup.labInstanceId = labInstance.id;
    const group = await this.groupService.getUserSingleGroup(createLabInstance.owner.id);
    labInstanceGroup.groupId = group.id;
    labInstanceGroup.role = CnLabInstanceGroupRole.OWNER;

    labInstance.sharedGroups = [labInstanceGroup];

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
    const userRole = await this.security.checkAuthorizationToFindById(labInstance, CnCurrentUserHelper.getAndCheckUserOrgaInfo());
    return CnLabFindOneDto.create(labInstance, userRole);
  }

  async getByCurrentOrganization(page: number, size: number): Promise<ClPageI<CnLabInstance>> {
    await this.security.checkAuthorizationToFindAllByOrganization(CnCurrentUserHelper.getAndCheckUserOrgaInfo());
    return this.labInstancesService.findByOrganization(CnCurrentUserHelper.getCurrentOrganization().id, page, size);
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

  async login(id: string): Promise<CnLabInstanceToken> {
    const labInstance: CnLabInstance = await this.getAndCheckAuthorizationToFindById(id);

    // check that the lab is running
    if (!labInstance.isRunning()) {
      throw new BadRequestException(CnErrorText.LAB_STOPPED);
    }

    try {
      const token =
        await this.externalLabUserService.generateTempAccess(labInstance.getGlabApiInfo(), CnCurrentUserHelper.getAndCheckCurrentUser());

      return new CnLabInstanceToken(labInstance, token.temp_token);
    } catch (e: any) {
      const error: CnExternalLabError = (e.response as AxiosResponse)?.data ?? '';

      switch (error.code) {
        case 'gws_core.WRONG_CREDENTIALS_USER_NOT_ACTIVATED' :
          throw new UnauthorizedException(CnErrorText.LAB_USER_NOT_ACTIVATED);
        case 'gws_core.WRONG_CREDENTIALS_USER_NOT_FOUND' :
          throw new UnauthorizedException(CnErrorText.LAB_USER_NOT_FOUND);
        default:
          this.logger.error(e);
          throw new BadRequestException(CnErrorText.LAB_AUTH_ERROR);
      }
    }
  }

  async getStatusHistory(id: string): Promise<CnLabInstanceStatusHistory[]> {
    // check that the user can get experiment
    await this.getAndCheckAuthorizationToFindById(id);

    return await this.labInstancesService.getStatusHistory(id) as CnLabInstanceStatusHistory[];
  }

  async findAll(): Promise<CnLabInstance[]> {
    await this.security.checkAuthorizationToFindAll(CnCurrentUserHelper.getAndCheckUserOrgaInfo());

    return this.labInstancesService.findAll();
  }

  public async updateName(labInstanceId: string, name: string): Promise<CnLabInstance> {
    await this.getAndCheckAuthorizationToFindById(labInstanceId);

    return this.labInstancesService.updateName(labInstanceId, name);
  }

  public async getLabInstanceConfig(labInstanceId: string): Promise<CnLabConfig> {
    await this.getAndCheckAuthorizationToFindById(labInstanceId);

    return this.labInstancesService.getLabConfig(labInstanceId);
  }

  /////////////////////////////////////// EXTERNAL LAB SERVICE //////////////////////////////////

  async getLabUsers(labInstanceId: string): Promise<CnExternalLabUser[]> {
    // check that the user can get the lab
    const lab: CnLabInstance = await this.getAndCheckAuthorizationToFindById(labInstanceId);

    return this.externalLabUserService.getUsers(lab.getGlabApiInfo());
  }

  async addUser(labInstanceId: string, newUser: CnExternalNewLabUser): Promise<CnExternalLabUser> {
    // check that the user can get the lab
    const lab: CnLabInstance = await this.getAndCheckAuthorizationToFindById(labInstanceId);

    const user: CnUser = await this.userService.findByIdAndCheck(newUser.userId);

    return this.externalLabUserService.addUser(lab.getGlabApiInfo(), user, newUser.group);
  }


  public async checkStatus(labInstanceId: string): Promise<CnExternalLabUser[]> {
    const lab: CnLabInstance = await this.getAndCheckAuthorizationToFindById(labInstanceId);

    try {
      await this.externalLabApiService.healthCheck(lab.getGlabApiInfo());
    } catch {
      throw new BadRequestException('The lab is not running');
    }

    try {
      return await this.externalLabApiService.getSettings(lab.getGlabApiInfo());
    } catch {
      throw new BadRequestException('Can\'t retrieve the settings');
    }
  }

  /////////////////////////////////////// GROUPS //////////////////////////////////

  public async shareLabInstance(labInstanceId: string, groupId: string, role: CnLabInstanceGroupRole): Promise<CnLabInstanceGroup> {
    const labInstance = await this.getAndCheckAuthorizationToManageLab(labInstanceId);
    const group = await this.groupService.findByIdAndCheck(groupId);

    if (group instanceof CnGroupTeam && group.organization.id !== labInstance.organization.id) {
      throw new BadRequestException('The group is not in the same organization');
    }

    return this.labInstanceGroupService.createLabInstanceGroup(labInstance, group, role);
  }

  public async updateShareRole(labInstanceId: string, groupId: string, role: CnLabInstanceGroupRole): Promise<CnLabInstanceGroup> {
    await this.getAndCheckAuthorizationToManageLab(labInstanceId);

    return this.labInstanceGroupService.updateLabInstanceGroupRole(labInstanceId, groupId, role);
  }

  public async unshareLabInstance(labInstanceId: string, groupId: string): Promise<void> {
    await this.getAndCheckAuthorizationToManageLab(labInstanceId);

    return this.labInstanceGroupService.deleteLabInstanceGroup(labInstanceId, groupId);
  }

  /**
   * Return the list of shared group for tha root project
   */
  public async getLabInstanceSharedGroups(labInstanceId: string): Promise<CnLabInstanceGroup[]> {
    const labInstance = await this.getAndCheckAuthorizationToFindById(labInstanceId);

    return this.labInstanceGroupService.findByLabInstanceId(labInstance.id);
  }

  /**
   * Return the complete list of user that have access to the project
   * @param id
   */
  public async getLabInstanceSharedUsers(id: string): Promise<CnUser[]> {
    const groups = await this.getLabInstanceSharedGroups(id);

    // get the group of the root project then the user
    const groupIds = groups.map(sharedGroup => sharedGroup.groupId);
    return this.groupService.getUsersOfGroups(groupIds);
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
    return this.labManagerService.initAll(labInstance);
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

  //////////////////////////// AUTHORIZATION ////////////////////////////////
  private async getAndCheckAuthorizationToFindById(id: string): Promise<CnLabInstance> {
    const labInstance = await this.labInstancesService.findByIdAndCheck(id);
    await this.security.checkAuthorizationToFindById(labInstance, CnCurrentUserHelper.getAndCheckUserOrgaInfo());
    return labInstance;
  }


  private async getAndCheckAuthorizationToUpdate(id: string): Promise<CnLabInstance> {
    const labInstance = await this.labInstancesService.findByIdAndCheck(id, {sharedGroups: true});
    this.security.checkAuthorizationToUpdate(labInstance, CnCurrentUserHelper.getAndCheckUserOrgaInfo());
    return labInstance;
  }

  private async getAndCheckAuthorizationToManageLab(id: string): Promise<CnLabInstance> {
    const labInstance = await this.labInstancesService.findByIdAndCheck(id, {sharedGroups: true});
    await this.security.checkAuthorizationToManageLab(labInstance, CnCurrentUserHelper.getAndCheckUserOrgaInfo());
    return labInstance;
  }


}
