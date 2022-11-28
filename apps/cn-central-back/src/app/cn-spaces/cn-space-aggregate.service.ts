import {BadRequestException, Injectable} from '@nestjs/common';
import {CnSpaceService} from './cn-space.service';
import {CnCurrentUserHelper} from '../cn-core/utils/cn-current-user.helper';
import {CnSpace} from './cn-space.entity';
import {CnSpaceAggregateSecurity} from './cn-space-aggregate-security.service';
import {ClPage} from '@monorepo/core-lib';
import {CnUsersService} from '../cn-users/cn-users.service';
import {CnSpaceUserService} from './cn-space-user.service';
import {CnSpaceUser, CnSpaceUserRole} from './cn-space-user.entity';
import {CnErrorText} from '../cn-core/model/config/cn-error-text.class';
import {BlFile} from '@monorepo/back-core-lib';
import {IncomingMessage} from 'http';
import {CnSpaceInvit} from './cn-space-invit.entity';
import {CnSpaceInvitService} from './cn-space-invit.service';
import {CnSpaceInvitDto, CnRequestNewLicensesDto} from './cn-space.dto';
import {CnUserAccountsService} from '../cn-users/cn-users-account/cn-user-accounts.service';
import {CnUser} from '../cn-users/cn-user.entity';
import {DataSource, EntityManager} from 'typeorm';
import {CmUserStatus} from '@monorepo/common-model';
import {CnUserSpaceInfo} from '../cn-users/cn-user-space-info.dto';
import {CnSpacesMailService} from './cn-spaces-mail.service';

@Injectable()
export class CnSpaceAggregateService {

  constructor(private spaceService: CnSpaceService,
              private spaceUserService: CnSpaceUserService,
              private spaceAggregateSecurity: CnSpaceAggregateSecurity,
              private invitationService: CnSpaceInvitService,
              private userService: CnUsersService,
              private userAccountService: CnUserAccountsService,
              private datasource: DataSource,
              private spacesMailService: CnSpacesMailService) {
  }

  public async getCurrentInfo(): Promise<CnUserSpaceInfo> {
    const user = await this.userService.getCurrent();
    let space: CnSpace = CnCurrentUserHelper.getCurrentSpace();
    let role: CnSpaceUserRole = CnCurrentUserHelper.getCurrentRoleInSpace();
    if (!space) {
      space = await this.spaceUserService.getUserDefaultSpace(user.id);
    }

    if (!role) {
      const spaceUser = await this.spaceUserService.findOneBySpaceIdAndUserId(space.id, user.id);
      role = spaceUser.role;
    }

    return new CnUserSpaceInfo(user, space, role);
  }

  public create(entity: CnSpace): Promise<CnSpace> {
    this.checkAdmin();
    return this.spaceService.create(entity);
  }

  public async update(entity: CnSpace): Promise<CnSpace> {
    this.checkAdmin();
    return this.spaceService.update(entity);
  }

  public async delete(id: string): Promise<void> {
    this.checkAdmin();

    const users = await this.getUsersOfSpace(id, 0, 1);

    if (users.totalElements > 0) {
      throw new BadRequestException('Can\'t delete the space because there are users in the space');
    }
    await this.spaceService.deleteById(id);
  }

  public async getDefaultSpace(): Promise<CnSpace> {
    return this.spaceUserService.getUserDefaultSpace(CnCurrentUserHelper.getCurrentUser().id);
  }

  public async findCurrentSpace(): Promise<CnSpace> {
    return CnCurrentUserHelper.getAndCheckCurrentSpace();
  }

  public async findCurrentUserSpaces(): Promise<CnSpace[]> {
    return await this.spaceUserService.getSpacesOfUser(CnCurrentUserHelper.getCurrentUser().id);
  }

  public async findOne(id: string): Promise<CnSpace> {
    id = this.getSpaceId(id);
    await this.checkSpaceMember(id);
    return this.spaceService.findByIdAndCheck(id);
  }


  public async getUsersOfSpace(id: string, page: number, size: number): Promise<ClPage<CnSpaceUser>> {
    id = this.getSpaceId(id);
    await this.checkSpaceMember(id);
    return this.spaceUserService.findBySpace(id, page, size);
  }

  public async getUserOfSpace(id: string, userId: string): Promise<CnUser>{
    id = this.getSpaceId(id);
    await this.checkSpaceMember(id);
    return this.spaceUserService.findUserBySpaceIdAndId(id, userId);
  }

  public async getAll(page: number, size: number): Promise<ClPage<CnSpace>> {
    this.checkAdmin();

    return this.spaceService.getAll(page, size);
  }

  public async uploadSpacePhoto(spaceId: string, file: BlFile): Promise<CnSpace> {
    spaceId = this.getSpaceId(spaceId);
    await this.checkSpaceAdmin(spaceId);

    const space = await this.spaceService.findByIdAndCheck(spaceId);

    return this.spaceService.uploadPhoto(space, file);
  }

  public async getPhoto(filename: string): Promise<IncomingMessage> {
    return await this.spaceService.getPhoto(filename);
  }


  /////////////////////////////////////// USERS //////////////////////////////////

  /**
   * Directly add a user to an space. Only accessible by G admins.
   */
  public async addUserToSpace(spaceID: string, userId: string): Promise<CnSpaceUser> {
    await this.checkAdmin();

    spaceID = this.getSpaceId(spaceID);
    const user = await this.userService.findByIdAndCheck(userId);
    const space = await this.spaceService.findByIdAndCheck(spaceID);

    return await this.spaceUserService.addUserToSpace(space, user, CnSpaceUserRole.USER);
  }

  public async removeUserFromSpace(spaceId: string, userId: string): Promise<void> {
    spaceId = this.getSpaceId(spaceId);
    // if a normal user tries to remove the last admin of the space, an error is thrown
    if (await this.spaceUserService.isOnlyAdmin(spaceId, userId)
      && !CnCurrentUserHelper.getCurrentUser().isAdmin()) {
      throw new Error(CnErrorText.CANNOT_REMOVE_LAST_ADMIN);
    }

    await this.checkSpaceAdmin(spaceId);
    const user = await this.userService.findByIdAndCheck(userId);

    await this.spaceUserService.removeUserFromSpace(spaceId, user.id);
  }

  public async activateUserInSpace(spaceId: string, userId: string): Promise<void> {
    spaceId = this.getSpaceId(spaceId);
    await this.checkSpaceAdmin(spaceId);

    await this.spaceUserService.activateUser(spaceId, userId);
  }

  public async deactivateUserInSpace(spaceId: string, userId: string): Promise<void> {
    spaceId = this.getSpaceId(spaceId);
    await this.checkSpaceAdmin(spaceId);

    // if a normal user tries to deactivate the last admin of the space, an error is thrown
    if (await this.spaceUserService.isOnlyAdmin(spaceId, userId)
      && !CnCurrentUserHelper.getCurrentUser().isAdmin()) {
      throw new Error(CnErrorText.CANNOT_DEACTIVATE_LAST_ADMIN);
    }

    await this.spaceUserService.deactivateUser(spaceId, userId);
  }


  public async updateUserRoleInSpace(spaceId: string, userId: string, role: CnSpaceUserRole): Promise<void> {
    spaceId = this.getSpaceId(spaceId);
    if (role === CnSpaceUserRole.USER &&
      await this.spaceUserService.isOnlyAdmin(spaceId, userId) &&
      !CnCurrentUserHelper.getCurrentUser().isAdmin()) {
      throw new Error(CnErrorText.CANNOT_REMOVE_LAST_ADMIN);
    }

    await this.checkSpaceAdmin(spaceId);

    await this.spaceUserService.updateUserRole(spaceId, userId, role);
  }

  /////////////////////////////////////// INVITATION //////////////////////////////////

  public async getInvitationByCode(code: string): Promise<CnSpaceInvit> {
    return await this.invitationService.findByCodeAndCheckValidity(code);
  }

  public async inviteUserToSpace(spaceId: string, invitDto: CnSpaceInvitDto): Promise<CnSpaceInvit> {
    spaceId = this.getSpaceId(spaceId);
    await this.checkSpaceAdmin(spaceId);

    const space = await this.spaceService.findByIdAndCheck(spaceId);

    const member = await this.spaceUserService.findOneBySpaceIdAndUserEmail(
      spaceId, invitDto.userMail);

    if (member) {
      throw new BadRequestException(CnErrorText.USER_ALREADY_IN_SPACE);
    }

    return this.invitationService.createInvitation(space, invitDto);
  }

  public async resendInvitation(invitationId: string): Promise<void> {
    const invitation = await this.invitationService.findByIdAndCheck(invitationId, {space: true});
    await this.checkSpaceAdmin(invitation.spaceId);

    return this.invitationService.resendInvitation(invitation);
  }

  public async refreshInvitationValidUntil(invitationId: string): Promise<CnSpaceInvit> {
    const invitation = await this.invitationService.findByIdAndCheck(invitationId, {space: true});
    await this.checkSpaceAdmin(invitation.spaceId);

    return this.invitationService.refreshValidUntil(invitation);
  }

  public async updateInvitationRole(invitationId: string, role: CnSpaceUserRole): Promise<CnSpaceInvit> {
    const invitation = await this.invitationService.findByIdAndCheck(invitationId);
    await this.checkSpaceAdmin(invitation.spaceId);

    return this.invitationService.updateInvitationRole(invitation, role);
  }

  public async deleteInvitation(invitationId: string): Promise<void> {
    const invitation = await this.invitationService.findByIdAndCheck(invitationId);
    await this.checkSpaceAdmin(invitation.spaceId);

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

  private async acceptInvitation(invitation: CnSpaceInvit, user: CnUser,
                                 entityManager: EntityManager): Promise<CnUser> {
    if (invitation.userMail !== user.email) {
      throw new BadRequestException('The invitation email does not match the user email');
    }

    await this.spaceUserService.addUserToSpace(invitation.space, user, invitation.role, entityManager);

    await this.invitationService.deleteById(invitation.id, entityManager);

    return user;
  }

  public async getNotificationsBySpace(spaceId: string, page: number,
                                       pageSize: number): Promise<ClPage<CnSpaceInvit>> {
    spaceId = this.getSpaceId(spaceId);
    await this.checkSpaceAdmin(spaceId);

    return this.invitationService.findNotificationsBySpaceId(spaceId, page, pageSize);
  }

  /////////////////////////////////////// OTHERS //////////////////////////////////

  public async requestNewLicenses(spaceId: string, request: CnRequestNewLicensesDto): Promise<void> {
    const userInfo = CnCurrentUserHelper.getAndCheckUserSpaceInfo();
    await this.checkSpaceAdmin(userInfo.spaceId);

    await this.spacesMailService.requestNewLicenses(request, userInfo);
  }

  /////////////////////////////////////// SECURITY //////////////////////////////////


  private async checkSpaceMember(spaceId: string): Promise<void> {
    await this.spaceAggregateSecurity.checkIsSpaceMember(spaceId, CnCurrentUserHelper.getCurrentUser());
  }

  private async checkSpaceAdmin(spaceId: string): Promise<void> {
    await this.spaceAggregateSecurity.checkIsSpaceAdmin(spaceId, CnCurrentUserHelper.getCurrentUser());
  }

  private checkAdmin(): void {
    this.spaceAggregateSecurity.checkIsAdmin(CnCurrentUserHelper.getAndCheckCurrentUser());
  }

  /**
   * If the id is 'current', the id of the current space is returned.
   * @param spaceId
   * @private
   */
  private getSpaceId(spaceId: string): string {
    if (spaceId === 'current') return CnCurrentUserHelper.getAndCheckCurrentSpace().id;
    return spaceId;
  }
}
