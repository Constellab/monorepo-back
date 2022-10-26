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
import {BlFile} from '@monorepo/back-core-lib';
import {IncomingMessage} from 'http';
import {CnOrganizationInvit} from './cn-organization-invit.entity';
import {CnOrganizationInvitService} from './cn-organization-invit.service';
import {CnOrganizationInvitDto} from './cn-organization.dto';
import {CnUserAccountsService} from '../cn-users/cn-users-account/cn-user-accounts.service';
import {CnUser} from '../cn-users/cn-user.entity';
import {DataSource, EntityManager} from 'typeorm';
import {CmUserStatus} from '@monorepo/common-model';

@Injectable()
export class CnOrganizationAggregateService {

  constructor(private organizationService: CnOrganizationsService,
              private organizationUserService: CnOrganizationUserService,
              private organizationSecurity: CnOrganizationAggregateSecurity,
              private invitationService: CnOrganizationInvitService,
              private userService: CnUsersService,
              private userAccountService: CnUserAccountsService,
              private datasource: DataSource) {
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
    id = this.getOrganizationId(id);
    await this.checkOrganizationMember(id);
    return this.organizationService.findByIdAndCheck(id);
  }


  public async getUsersOfOrganization(id: string, page: number, size: number): Promise<ClPage<CnOrganizationUser>> {
    id = this.getOrganizationId(id);
    await this.checkOrganizationMember(id);
    return this.organizationUserService.getUsersOfOrganization(id, page, size);
  }

  public async getAll(page: number, size: number): Promise<ClPage<CnOrganization>> {
    this.checkAdmin();

    return this.organizationService.getAll(page, size);
  }

  public async uploadOrganizationPhoto(organizationId: string, file: BlFile): Promise<CnOrganization> {
    organizationId = this.getOrganizationId(organizationId);
    await this.checkOrganizationAdmin(organizationId);

    const organization = await this.organizationService.findByIdAndCheck(organizationId);

    return this.organizationService.uploadPhoto(organization, file);
  }

  public async getPhoto(filename: string): Promise<IncomingMessage> {
    return await this.organizationService.getPhoto(filename);
  }


  /////////////////////////////////////// USERS //////////////////////////////////

  /**
   * Directly add a user to an organization. Only accessible by G admins.
   */
  public async addUserToOrganization(organizationId: string, userId: string, role: CnOrganizationUserRole): Promise<CnOrganizationUser> {
    await this.checkAdmin();

    organizationId = this.getOrganizationId(organizationId);
    const user = await this.userService.findByIdAndCheck(userId);
    const organization = await this.organizationService.findByIdAndCheck(organizationId);

    return await this.organizationUserService.addUserToOrganization(organization, user, role);
  }

  public async removeUserFromOrganization(organizationId: string, userId: string): Promise<void> {
    organizationId = this.getOrganizationId(organizationId);
    // if a normal user tries to remove the last admin of the organization, an error is thrown
    if (await this.organizationUserService.isOnlyAdmin(organizationId, userId)
      && !CnCurrentUserHelper.getCurrentUser().isAdmin()) {
      throw new Error(CnErrorText.CANNOT_REMOVE_LAST_ADMIN);
    }

    await this.checkOrganizationAdmin(organizationId);
    const user = await this.userService.findByIdAndCheck(userId);

    await this.organizationUserService.removeUserFromOrganization(organizationId, user.id);
  }

  public async activateUserInOrganization(organizationId: string, userId: string): Promise<void> {
    organizationId = this.getOrganizationId(organizationId);
    await this.checkOrganizationAdmin(organizationId);

    await this.organizationUserService.activateUser(organizationId, userId);
  }

  public async deactivateUserInOrganization(organizationId: string, userId: string): Promise<void> {
    organizationId = this.getOrganizationId(organizationId);
    await this.checkOrganizationAdmin(organizationId);

    // if a normal user tries to deactivate the last admin of the organization, an error is thrown
    if (await this.organizationUserService.isOnlyAdmin(organizationId, userId)
      && !CnCurrentUserHelper.getCurrentUser().isAdmin()) {
      throw new Error(CnErrorText.CANNOT_DEACTIVATE_LAST_ADMIN);
    }

    await this.organizationUserService.deactivateUser(organizationId, userId);
  }


  public async updateUserRoleInOrganization(organizationId: string, userId: string, role: CnOrganizationUserRole): Promise<void> {
    organizationId = this.getOrganizationId(organizationId);
    if (role === CnOrganizationUserRole.USER &&
      await this.organizationUserService.isOnlyAdmin(organizationId, userId) &&
      !CnCurrentUserHelper.getCurrentUser().isAdmin()) {
      throw new Error(CnErrorText.CANNOT_REMOVE_LAST_ADMIN);
    }

    await this.checkOrganizationAdmin(organizationId);

    await this.organizationUserService.updateUserRole(organizationId, userId, role);
  }

  /////////////////////////////////////// INVITATION //////////////////////////////////

  public async getInvitationByCode(code: string): Promise<CnOrganizationInvit> {
    return await this.invitationService.findByCodeAndCheckValidity(code);
  }

  public async inviteUserToOrganization(organizationId: string, invitDto: CnOrganizationInvitDto): Promise<CnOrganizationInvit> {
    organizationId = this.getOrganizationId(organizationId);
    await this.checkOrganizationAdmin(organizationId);

    const organization = await this.organizationService.findByIdAndCheck(organizationId);

    const member = await this.organizationUserService.findOneByOrganizationIdAndUserEmail(
      organizationId, invitDto.userMail);

    if (member) {
      throw new BadRequestException(CnErrorText.USER_ALREADY_IN_ORGANIZATION);
    }

    return this.invitationService.createInvitation(organization, invitDto);
  }

  public async resendInvitation(invitationId: string): Promise<void> {
    const invitation = await this.invitationService.findByIdAndCheck(invitationId, {organization: true});
    await this.checkOrganizationAdmin(invitation.organizationId);

    return this.invitationService.resendInvitation(invitation);
  }

  public async refreshInvitationValidUntil(invitationId: string): Promise<CnOrganizationInvit> {
    const invitation = await this.invitationService.findByIdAndCheck(invitationId, {organization: true});
    await this.checkOrganizationAdmin(invitation.organizationId);

    return this.invitationService.refreshValidUntil(invitation);
  }

  public async updateInvitationRole(invitationId: string, role: CnOrganizationUserRole): Promise<CnOrganizationInvit> {
    const invitation = await this.invitationService.findByIdAndCheck(invitationId);
    await this.checkOrganizationAdmin(invitation.organizationId);

    return this.invitationService.updateInvitationRole(invitation, role);
  }

  public async deleteInvitation(invitationId: string): Promise<void> {
    const invitation = await this.invitationService.findByIdAndCheck(invitationId);
    await this.checkOrganizationAdmin(invitation.organizationId);

    await this.invitationService.deleteById(invitationId);
  }

  /**
   * Method called when a user accepted an invitation and created an account
   */
  public async newUserAcceptsInvitation(code: string, user: CnUser): Promise<CnUser> {
    const invitation = await this.invitationService.findByCodeAndCheckValidity(code);

    return await this.datasource.transaction(async (transaction) => {
      // create the user with a active but incomplete profile
      const userDb = await this.userAccountService.createAccount(user, CmUserStatus.INCOMPLETE, transaction);

      return await this.acceptInvitation(invitation, userDb, transaction);
    });
  }

  /**
   * Method called when a user accepted an invitation and already has an account
   */
  public async existingUserAcceptsInvitation(code: string): Promise<CnUser> {
    const invitation = await this.invitationService.findByCodeAndCheckValidity(code);

    return await this.datasource.transaction(async (transaction) => {
      return await this.acceptInvitation(invitation, CnCurrentUserHelper.getAndCheckCurrentUser(), transaction);
    });

  }

  private async acceptInvitation(invitation: CnOrganizationInvit, user: CnUser,
                                 entityManager: EntityManager): Promise<CnUser> {
    if (invitation.userMail !== user.email) {
      throw new BadRequestException('The invitation email does not match the user email');
    }

    await this.organizationUserService.addUserToOrganization(invitation.organization, user, invitation.role, entityManager);

    await this.invitationService.deleteById(invitation.id, entityManager);

    return user;
  }

  public async getNotificationsByOrganization(organizationId: string, page: number,
                                              pageSize: number): Promise<ClPage<CnOrganizationInvit>> {
    organizationId = this.getOrganizationId(organizationId);
    await this.checkOrganizationAdmin(organizationId);

    return this.invitationService.findNotificationsByOrganization(organizationId, page, pageSize);
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

  /**
   * If the id is 'current', the id of the current organization is returned.
   * @param organizationId
   * @private
   */
  private getOrganizationId(organizationId: string): string {
    if (organizationId === 'current') return CnCurrentUserHelper.getAndCheckCurrentOrganization().id;
    return organizationId;
  }
}
