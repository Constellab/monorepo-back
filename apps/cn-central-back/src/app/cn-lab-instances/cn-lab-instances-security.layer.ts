import {BadRequestException, Injectable, UnauthorizedException} from '@nestjs/common';
import {CnAbstractSecurityLayer} from '../cn-core/class/cn-abstract-security.layer';
import {CnLabInstance} from './cn-lab-instance.entity';
import {CnLabInstancesService} from './cn-lab-instances.service';
import {CnCreatedByAuthorization} from '../cn-core/security/cn-created-by.authorization';
import {CnLabInstanceStatusHistory} from './cn-lab-instance-status-history.entity';
import {CnLabInstanceToken} from './cn-lab-instance-token.class';
import {CnErrorText} from '../cn-core/model/config/cn-error-text.class';
import {CnUser} from '../cn-users/cn-user.entity';
import {CnAdminAuthorization} from '../cn-core/security/cn-admin.authorization';
import {CnOwnerAuthorization} from '../cn-core/security/cn-owner.authorization';
import {CnCombinedAuthorization} from '../cn-core/security/cn-combined.authorization';
import {CnExternalLabUser, CnExternalNewLabUser} from '../cn-external-lab-api/model/cn-external-lab-api.class';
import {ClPageI} from '@monorepo/core-lib';
import {CnCurrentUserHelper} from '../cn-core/utils/cn-current-user.helper';
import {
  CnLabComposeUpOptions,
  CnLabDockerPs,
  CnLabManagerStatus
} from '../cn-external-lab-api/model/cn-lab-manager.class';
import {CnLabManagerService} from './cn-lab-manager.service';


@Injectable()
export class CnLabInstancesSecurityLayer extends CnAbstractSecurityLayer<CnLabInstance> {

  constructor(private service: CnLabInstancesService,
              private labManagerService: CnLabManagerService) {
    super(service);
  }

  async isAuthorizedToCreate(): Promise<boolean> {
    return new CnAdminAuthorization().isAuthorized();
  }

  async isAuthorizedToDelete(): Promise<boolean> {
    return new CnAdminAuthorization().isAuthorized();
  }

  async isAuthorizedToFindOne(dbEntity: CnLabInstance): Promise<boolean> {
    return new CnCombinedAuthorization('OR', new CnAdminAuthorization(), new CnOwnerAuthorization()).isAuthorized(dbEntity);
  }

  async isAuthorizedToUpdate(): Promise<boolean> {
    return new CnAdminAuthorization().isAuthorized();
  }

  async isAuthorizedToUpdateStatus(dbEntity: CnLabInstance): Promise<boolean> {
    return new CnCreatedByAuthorization().isAuthorized(dbEntity);
  }

  getCurrentLabInstances(page: number, size: number): Promise<ClPageI<CnLabInstance>> {
    // no security check because the get is filtered with user id
    return this.service.getCurrentLabInstances(page, size);
  }

  getCurrentRunningLabInstances(): Promise<CnLabInstance[]> {
    // no security check because the get is filtered with user id
    return this.service.getCurrentRunningLabInstances();
  }

  async startInstance(id: string): Promise<CnLabInstance> {
    await this.getAndCheckAuthorizationToFindById(id);

    return this.service.startInstance(id);
  }

  async stopInstance(id: string): Promise<CnLabInstance> {
    await this.getAndCheckAuthorizationToFindById(id);

    return this.service.stopInstance(id);
  }

  async login(id: string): Promise<CnLabInstanceToken> {
    const labInstance: CnLabInstance = await this.getAndCheckAuthorizationToFindById(id);

    // check that the lab is running
    if (!labInstance.isRunning()) {
      throw new BadRequestException(CnErrorText.LAB_STOPPED);
    }

    return this.service.login(labInstance);
  }

  async getStatusHistory(id: string): Promise<CnLabInstanceStatusHistory[]> {
    // check that the user can get experiment
    await this.getAndCheckAuthorizationToFindById(id);

    return await this.service.getStatusHistory(id) as CnLabInstanceStatusHistory[];
  }

  async findAll(): Promise<CnLabInstance[]> {
    const user: CnUser = CnCurrentUserHelper.getAndCheckCurrentUser();

    if (!user.isAdmin()) {
      throw new UnauthorizedException();
    }

    return this.service.findAll();
  }

  async getLabUsers(labInstanceId: string): Promise<CnExternalLabUser[]> {
    // check that the user can get the lab
    await this.getAndCheckAuthorizationToFindById(labInstanceId);

    return this.service.getLabUsers(labInstanceId);
  }

  async addUser(labInstanceId: string, newUser: CnExternalNewLabUser): Promise<CnExternalLabUser> {
    // check that the user can get the lab
    await this.getAndCheckAuthorizationToFindById(labInstanceId);

    return this.service.addUserToLab(labInstanceId, newUser);
  }

  public async updateName(labInstanceId: string, name: string): Promise<CnLabInstance> {
    await this.getAndCheckAuthorizationToFindById(labInstanceId);

    return this.service.updateName(labInstanceId, name);
  }

  public async checkStatus(labInstanceId: string): Promise<CnExternalLabUser[]> {
    await this.getAndCheckAuthorizationToFindById(labInstanceId);

    return this.service.checkStatus(labInstanceId);
  }

  //////////////////////////// LAB MANAGER ////////////////////////////////

  public async getStatus(labId: string): Promise<CnLabManagerStatus> {
    const labInstance: CnLabInstance = await this.checkAuthorizationLabManager(labId);
    return this.labManagerService.getLabStatus(labInstance);
  }

  public async listContainers(labId: string): Promise<CnLabDockerPs[]> {
    const labInstance: CnLabInstance = await this.checkAuthorizationLabManager(labId);
    return this.labManagerService.listContainers(labInstance);
  }

  public async getLogs(labId: string, containerName: string): Promise<string> {
    const labInstance: CnLabInstance = await this.checkAuthorizationLabManager(labId);
    return this.labManagerService.getLogs(labInstance, containerName);
  }

  public async initAll(labId: string): Promise<void> {
    const labInstance: CnLabInstance = await this.checkAuthorizationLabManager(labId);
    return this.labManagerService.initAll(labInstance);
  }

  public async upContainers(labId: string, options?: CnLabComposeUpOptions): Promise<void> {
    const labInstance: CnLabInstance = await this.checkAuthorizationLabManager(labId);
    return this.labManagerService.upContainers(labInstance, options);
  }

  public async restartContainers(labId: string, options?: CnLabComposeUpOptions): Promise<void> {
    const labInstance: CnLabInstance = await this.checkAuthorizationLabManager(labId);
    return this.labManagerService.restartContainers(labInstance, options);
  }

  public async downContainers(labId: string): Promise<void> {
    const labInstance: CnLabInstance = await this.checkAuthorizationLabManager(labId);
    return this.labManagerService.downContainers(labInstance);
  }

  public async pullBiota(labId: string): Promise<void> {
    const labInstance: CnLabInstance = await this.checkAuthorizationLabManager(labId);
    return this.labManagerService.pullBiota(labInstance);
  }

  public async registryLogin(labId: string): Promise<void> {
    const labInstance: CnLabInstance = await this.checkAuthorizationLabManager(labId);
    return this.labManagerService.registryLogin(labInstance);
  }

  public async stopCurrentTask(labId: string): Promise<void> {
    const labInstance: CnLabInstance = await this.checkAuthorizationLabManager(labId);
    return this.labManagerService.stopCurrentTask(labInstance);
  }

  private checkAuthorizationLabManager(labId: string): Promise<CnLabInstance> {
    return this.getAndCheckAuthorizationToUpdateById(labId);
  }

}
