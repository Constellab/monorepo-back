import {BadRequestException, Injectable, UnauthorizedException} from '@nestjs/common';
import {AbstractSecurityLayer} from '../core/class/abstract-security.layer';
import {LabInstance} from './lab-instance.entity';
import {LabInstancesService} from './lab-instances.service';
import {OwnerAuthorization} from '../core/security/owner.authorization';
import {LabInstanceStatusHistory} from './lab-instance-status-history.entity';
import {LabInstanceToken} from './lab-instance-token.class';
import {ErrorText} from '../core/model/config/error-text.class';
import {Page} from '../core/model/config/page.class';
import {User} from '../users/user.entity';
import {RequestContextHelper} from '../core/modules/request-context/request-context.helper';
import {AdminAuthorization} from '../core/security/admin.authorization';


@Injectable()
export class LabInstancesSecurityLayer extends AbstractSecurityLayer<LabInstance> {

  constructor(private service: LabInstancesService) {
    super(service);
  }

  async isAuthorizedToCreate(newEntity: LabInstance): Promise<boolean> {
    return new AdminAuthorization().isAuthorized();
  }

  async isAuthorizedToDelete(dbEntity: LabInstance): Promise<boolean> {
    return new AdminAuthorization().isAuthorized();
  }

  async isAuthorizedToFindOne(dbEntity: LabInstance): Promise<boolean> {
    return new OwnerAuthorization().isAuthorized(dbEntity);
  }

  async isAuthorizedToUpdate(dbEntity: LabInstance): Promise<boolean> {
    return new AdminAuthorization().isAuthorized();
  }

  async isAuthorizedToUpdateStatus(dbEntity: LabInstance): Promise<boolean> {
    return new OwnerAuthorization().isAuthorized(dbEntity);
  }

  getCurrentLabInstances(page: number, size: number): Promise<Page<LabInstance>> {
    // no security check because the get is filtered with user id
    return this.service.getCurrentLabInstances(page, size);
  }

  getCurrentRunningLabInstances(): Promise<LabInstance[]> {
    // no security check because the get is filtered with user id
    return this.service.getCurrentRunningLabInstances();
  }

  async startInstance(id: string): Promise<LabInstance> {
    await this.checkAuthorizationUpdateStatus(id);

    return this.service.startInstance(id);
  }

  async stopInstance(id: string): Promise<LabInstance> {
    await this.checkAuthorizationUpdateStatus(id);

    return this.service.stopInstance(id);
  }

  async checkAuthorizationUpdateStatus(id: string): Promise<void> {
    const entity: LabInstance = await this.getDbEntityForCheckUpdate(id);

    if (!await this.isAuthorizedToUpdateStatus(entity)) {
      throw new UnauthorizedException();
    }

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
    const user: User = RequestContextHelper.getAndCheckCurrentUser();

    if (!user.isAdmin()) {
      throw new UnauthorizedException();
    }

    return this.service.findAll();
  }


}
