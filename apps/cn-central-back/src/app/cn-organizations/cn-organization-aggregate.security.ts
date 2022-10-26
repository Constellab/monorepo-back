import {Injectable, UnauthorizedException} from '@nestjs/common';
import {CnUser} from '../cn-users/cn-user.entity';
import {CnOrganizationUserService} from './cn-organization-user.service';
import {CnOrganizationUser} from './cn-organization-user.entity';

@Injectable()
export class CnOrganizationAggregateSecurity {

  constructor(private organizationUserService: CnOrganizationUserService) {
  }

  public checkIsAdmin(user: CnUser): void {
    if (!this.isAdmin(user)) {
      throw new UnauthorizedException();
    }
  }

  public checkIsOrganizationAdmin(organizationId: string, user: CnUser): void {
    if (this.isAdmin(user)) return;

    if (!this.isOrganizationAdmin(organizationId, user.id)) {
      throw new UnauthorizedException();
    }
  }

  public async checkIsOrganizationMember(organizationId: string, user: CnUser): Promise<void> {
    if (this.isAdmin(user)) return;

    await this.getAndCheckOrganizationUser(organizationId, user.id);
  }

  private async isOrganizationAdmin(organizationId: string, userId: string): Promise<boolean> {
    const organizationUser = await this.getAndCheckOrganizationUser(organizationId, userId);
    return organizationUser.isOrganizationAdmin();
  }


  private async getAndCheckOrganizationUser(organizationId: string, userId: string): Promise<CnOrganizationUser> {
    const organizationUser = await this.organizationUserService.findOneByOrganizationIdAndUserId(userId, organizationId);
    if (!organizationUser) {
      throw new UnauthorizedException();
    }
    return organizationUser;
  }

  private isAdmin(user: CnUser): boolean {
    return user.isAdmin();
  }
}
