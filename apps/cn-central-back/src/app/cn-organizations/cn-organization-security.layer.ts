import {Injectable} from '@nestjs/common';
import {CnAbstractSecurityLayer} from '../cn-core/class/cn-abstract-security.layer';
import {CnOrganization} from './cn-organization.entity';
import {CnOrganizationsService} from './cn-organizations.service';
import {CnAdminAuthorization} from '../cn-core/security/cn-admin.authorization';
import {CnCurrentUserHelper} from '../cn-core/utils/cn-current-user.helper';
import {CnUser} from '../cn-users/cn-user.entity';
import {ClPage} from '@monorepo/core-lib';


@Injectable()
export class CnOrganizationSecurityLayer extends CnAbstractSecurityLayer<CnOrganization> {

  constructor(private service: CnOrganizationsService) {
    super(service);
  }

  async isAuthorizedToCreate(): Promise<boolean> {
    return new CnAdminAuthorization().isAuthorized();
  }

  async isAuthorizedToDelete(): Promise<boolean> {
    return new CnAdminAuthorization().isAuthorized();
  }

  async isAuthorizedToFindOne(entity: CnOrganization): Promise<boolean> {
    return new CnAdminAuthorization().isAuthorized() || CnCurrentUserHelper.getAndCheckCurrentUser().organizationId === entity.id;
  }

  async isAuthorizedToUpdate(): Promise<boolean> {
    return new CnAdminAuthorization().isAuthorized();
  }

  public async getAll(page: number, size: number): Promise<ClPage<CnOrganization>> {
    new CnAdminAuthorization().checkAuthorization();

    return this.service.getAll(page, size)
  }

  public async addUserToOrganization(organizationId: string, userId: string): Promise<CnUser> {
    await this.getAndCheckAuthorizationToFindById(organizationId);
    return this.service.addUserToOrganization(organizationId, userId);
  }

  public async removeUserFromOrganization(organizationId: string, userId: string): Promise<void> {
    await this.getAndCheckAuthorizationToFindById(organizationId);
    return this.service.removeUserFromOrganization(organizationId, userId);
  }

  public async getUsersOfOrganization(id: string, page: number, size: number): Promise<ClPage<CnUser>> {
    await this.getAndCheckAuthorizationToFindById(id);
    return this.service.getUsersOfOrganization(id, page, size);
  }


}
