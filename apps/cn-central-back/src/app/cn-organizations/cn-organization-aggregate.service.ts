import {BadRequestException, Injectable} from '@nestjs/common';
import {CnOrganizationsService} from './cn-organizations.service';
import {CnCurrentUserHelper} from '../cn-core/utils/cn-current-user.helper';
import {CnOrganization} from './cn-organization.entity';
import {CnOrganizationAggregateSecurity} from './cn-organization-aggregate.security';
import {ClPage} from '@monorepo/core-lib';
import {CnUsersService} from '../cn-users/cn-users.service';
import {CnOrganizationUserService} from './cn-organization-user.service';
import {CnOrganizationUser, CnOrganizationUserRole} from './cn-organization-user.entity';
import {CnErrorText} from '../cn-core/model/config/cn-error-text.class';

@Injectable()
export class CnOrganizationAggregateService {

  constructor(private organizationService: CnOrganizationsService,
              private organizationUserService: CnOrganizationUserService,
              private organizationSecurity: CnOrganizationAggregateSecurity,
              private userService: CnUsersService) {
  }

  public create(entity: CnOrganization): Promise<CnOrganization> {
    this.checkAdmin();
    return this.organizationService.create(entity);
  }

  public async update(entity: CnOrganization): Promise<CnOrganization> {
    this.checkAdmin();
    return this.organizationService.update(entity);
  }

  public async delete(id: string): Promise<void> {
    this.checkAdmin();

    const users = await this.getUsersOfOrganization(id, 0, 1);

    if (users.totalElements > 0) {
      throw new BadRequestException('Can\'t delete the organization because there are users in the organization');
    }
    await this.organizationService.deleteById(id);
  }

  public async getDefaultOrganization(): Promise<CnOrganization> {
    const organization = await this.organizationUserService.getOrganizationsOfUser(CnCurrentUserHelper.getCurrentUser().id);
    if (organization.length === 0) {
      throw new BadRequestException('No organization found');
    }
    return organization[0];
  }

  public async findCurrentOrganization(): Promise<CnOrganization> {
    return CnCurrentUserHelper.getAndCheckCurrentOrganization();
  }

  public async findOne(id: string): Promise<CnOrganization> {
    await this.checkOrganizationMember(id);
    return this.organizationService.findByIdAndCheck(id);
  }

  public async getUserOfCurrentOrganization(page: number, size: number): Promise<ClPage<CnOrganizationUser>> {
    return this.getUsersOfOrganization(CnCurrentUserHelper.getAndCheckCurrentOrganization().id,
      page, size);
  }

  public async getUsersOfOrganization(id: string, page: number, size: number): Promise<ClPage<CnOrganizationUser>> {
    await this.checkOrganizationMember(id);
    return this.organizationUserService.getUsersOfOrganization(id, page, size);
  }

  public async getAll(page: number, size: number): Promise<ClPage<CnOrganization>> {
    this.checkAdmin();

    return this.organizationService.getAll(page, size);
  }


  /////////////////////////////////////// USERS //////////////////////////////////

  public async addUserToCurentOrganization(userId: string): Promise<CnOrganizationUser> {
    return this.addUserToOrganization(CnCurrentUserHelper.getAndCheckCurrentOrganization().id, userId);
  }

  public async addUserToOrganization(organizationId: string, userId: string): Promise<CnOrganizationUser> {
    await this.checkOrganizationAdmin(organizationId);
    const user = await this.userService.findByIdAndCheck(userId);
    const organization = await this.organizationService.findByIdAndCheck(organizationId);

    return await this.organizationUserService.addUserToOrganization(organization, user);
  }

  public async removeUserFromCurrentOrganization(userId: string): Promise<void> {
    await this.removeUserFromOrganization(CnCurrentUserHelper.getAndCheckCurrentOrganization().id, userId);
  }

  public async removeUserFromOrganization(organizationId: string, userId: string): Promise<void> {
    // if a normal user tries to remove the last admin of the organization, an error is thrown
    if (await this.organizationUserService.isOnlyAdmin(organizationId, userId)
      && !CnCurrentUserHelper.getCurrentUser().isAdmin()) {
      throw new Error(CnErrorText.CANNOT_REMOVE_LAST_ADMIN);
    }

    await this.checkOrganizationAdmin(organizationId);
    const user = await this.userService.findByIdAndCheck(userId);

    await this.organizationUserService.removeUserFromOrganization(organizationId, user.id);
  }

  public async activateUserInCurrentOrganization(userId: string): Promise<void> {
    return this.activateUserInOrganization(CnCurrentUserHelper.getAndCheckCurrentOrganization().id, userId);
  }

  public async activateUserInOrganization(organizationId: string, userId: string): Promise<void> {
    await this.checkOrganizationAdmin(organizationId);

    await this.organizationUserService.activateUser(organizationId, userId);
  }

  public async deactivateUserInCurrentOrganization(userId: string): Promise<void> {
    return this.deactivateUserInOrganization(CnCurrentUserHelper.getAndCheckCurrentOrganization().id, userId);
  }

  public async deactivateUserInOrganization(organizationId: string, userId: string): Promise<void> {
    await this.checkOrganizationAdmin(organizationId);

    // if a normal user tries to deactivate the last admin of the organization, an error is thrown
    if (await this.organizationUserService.isOnlyAdmin(organizationId, userId)
      && !CnCurrentUserHelper.getCurrentUser().isAdmin()) {
      throw new Error(CnErrorText.CANNOT_DEACTIVATE_LAST_ADMIN);
    }

    await this.organizationUserService.deactivateUser(organizationId, userId);
  }

  public async updateUserRoleInCurrentOrganization(userId: string, role: CnOrganizationUserRole): Promise<void> {
    return this.updateUserRoleInOrganization(CnCurrentUserHelper.getAndCheckCurrentOrganization().id, userId, role);
  }

  public async updateUserRoleInOrganization(organizationId: string, userId: string, role: CnOrganizationUserRole): Promise<void> {
    if (role === CnOrganizationUserRole.USER &&
      await this.organizationUserService.isOnlyAdmin(organizationId, userId) &&
      !CnCurrentUserHelper.getCurrentUser().isAdmin()) {
      throw new Error(CnErrorText.CANNOT_REMOVE_LAST_ADMIN);
    }

    await this.checkOrganizationAdmin(organizationId);

    await this.organizationUserService.updateUserRole(organizationId, userId, role);
  }


  /////////////////////////////////////// SECURITY //////////////////////////////////


  private async checkOrganizationMember(organizationId: string): Promise<void> {
    await this.organizationSecurity.checkIsOrganizationMember(organizationId, CnCurrentUserHelper.getCurrentUser());
  }

  private async checkOrganizationAdmin(organizationId: string): Promise<void> {
    await this.organizationSecurity.checkIsOrganizationAdmin(organizationId, CnCurrentUserHelper.getCurrentUser());
  }

  private checkAdmin(): void {
    this.organizationSecurity.checkIsAdmin(CnCurrentUserHelper.getAndCheckCurrentUser());
  }
}
