import {BadRequestException, Injectable, UnauthorizedException} from '@nestjs/common';
import {AbstractSecurityLayer} from '../core/class/abstract-security.layer';
import {LabInstance} from './lab-instance.entity';
import {LabInstancesService} from './lab-instances.service';
import {CreatedByAuthorization} from '../core/security/created-by.authorization';
import {LabInstanceStatusHistory} from './lab-instance-status-history.entity';
import {LabInstanceToken} from './lab-instance-token.class';
import {ErrorText} from '../core/model/config/error-text.class';
import {User} from '../users/user.entity';
import {AdminAuthorization} from '../core/security/admin.authorization';
import {OwnerAuthorization} from '../core/security/owner.authorization';
import {CombinedAuthorization} from '../core/security/combined.authorization';
import {ExternalLabUser, ExternalNewLabUser} from '../external-lab-api/external-lab-api.class';
import {ClPage} from '@monorepo/core-lib';
import {CurrentUserHelper} from '../core/utils/current-user.helper';


@Injectable()
export class LabInstancesSecurityLayer extends AbstractSecurityLayer<LabInstance> {

  constructor(private service: LabInstancesService) {
    super(service);
  }

  async isAuthorizedToCreate(): Promise<boolean> {
    return new AdminAuthorization().isAuthorized();
  }

  async isAuthorizedToDelete(): Promise<boolean> {
    return new AdminAuthorization().isAuthorized();
  }

  async isAuthorizedToFindOne(dbEntity: LabInstance): Promise<boolean> {
    return new CombinedAuthorization('OR', new AdminAuthorization(), new OwnerAuthorization()).isAuthorized(dbEntity);
  }

  async isAuthorizedToUpdate(): Promise<boolean> {
    return new AdminAuthorization().isAuthorized();
  }

  async isAuthorizedToUpdateStatus(dbEntity: LabInstance): Promise<boolean> {
    return new CreatedByAuthorization().isAuthorized(dbEntity);
  }

  getCurrentLabInstances(page: number, size: number): Promise<ClPage<LabInstance>> {
    // no security check because the get is filtered with user id
    return this.service.getCurrentLabInstances(page, size);
  }

  getCurrentRunningLabInstances(): Promise<LabInstance[]> {
    // no security check because the get is filtered with user id
    return this.service.getCurrentRunningLabInstances();
  }

  async startInstance(id: string): Promise<LabInstance> {
    await this.getAndCheckAuthorizationToUpdateById(id);

    return this.service.startInstance(id);
  }

  async stopInstance(id: string): Promise<LabInstance> {
    await this.getAndCheckAuthorizationToUpdateById(id);

    return this.service.stopInstance(id);
  }

  async login(id: string): Promise<LabInstanceToken> {
    const labInstance: LabInstance = await this.getAndCheckAuthorizationToFindById(id);

    // check that the lab is running
    if (!labInstance.isRunning()) {
      throw new BadRequestException(ErrorText.LAB_STOPPED);
    }

    return this.service.login(labInstance);
  }

  async getStatusHistory(id: string): Promise<LabInstanceStatusHistory[]> {
    // check that the user can get experiment
    await this.getAndCheckAuthorizationToFindById(id);

    return await this.service.getStatusHistory(id) as LabInstanceStatusHistory[];
  }

  async findAll(): Promise<LabInstance[]> {
    const user: User = CurrentUserHelper.getAndCheckCurrentUser();

    if (!user.isAdmin()) {
      throw new UnauthorizedException();
    }

    return this.service.findAll();
  }

  async getLabUsers(labInstanceId: string): Promise<ExternalLabUser[]> {
    // check that the user can get the lab
    await this.getAndCheckAuthorizationToFindById(labInstanceId);

    return this.service.getLabUsers(labInstanceId);
  }

  async addUser(labInstanceId: string, newUser: ExternalNewLabUser): Promise<ExternalLabUser> {
    // check that the user can get the lab
    await this.getAndCheckAuthorizationToFindById(labInstanceId);

    return this.service.addUserToLab(labInstanceId, newUser);
  }

  public async updateName(labInstanceId: string, name: string): Promise<LabInstance> {
    await this.getAndCheckAuthorizationToFindById(labInstanceId);

    return this.service.updateName(labInstanceId, name);
  }

}
