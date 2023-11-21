import {Injectable} from '@nestjs/common';
import {CnSpaceService} from './cn-space.service';
import {CnCurrentUserHelper} from '../cn-core/utils/cn-current-user.helper';
import {CnSpace, CnSpaceType} from './cn-space.entity';
import {CnSpaceAggregateSecurity} from './cn-space-aggregate-security.service';
import {ClPage} from '@monorepo/core-lib';
import {CnUsersService} from '../cn-users/cn-users.service';
import {CnSpaceUserService} from './cn-space-user.service';
import {CnSpaceUser, CnSpaceUserRole} from './cn-space-user.entity';
import {CnErrorText} from '../cn-core/model/config/cn-error-text.class';
import {BlBadRequestException, BlFile, BlSearchParams} from '@monorepo/back-core-lib';
import {IncomingMessage} from 'http';
import {CnSpaceInvit} from './cn-space-invit.entity';
import {CnSpaceInvitService} from './cn-space-invit.service';
import {
  CnRequestNewLicensesDto,
  CnSaveSpaceDTO,
  CnSpaceInvitCreateDto,
  CnSpaceInvitReadDto,
  CnSpaceSettingsDto
} from './cn-space.dto';
import {CnUser} from '../cn-users/cn-user.entity';
import {DataSource, EntityManager} from 'typeorm';
import {CnUserSpaceInfo} from '../cn-users/cn-user.dto';
import {CnSpacesMailService} from './cn-spaces-mail.service';
import {CnBucket} from '../cn-object-storages/cn-buckets/cn-bucket.entity';
import {CnObjectStoragesAggregateService} from '../cn-object-storages/cn-object-storages-aggregate.service';

@Injectable()
export class CnSpaceAggregateService {

  constructor(private spaceService: CnSpaceService,
              private spaceUserService: CnSpaceUserService,
              private spaceAggregateSecurity: CnSpaceAggregateSecurity,
              private invitationService: CnSpaceInvitService,
              private userService: CnUsersService,
              private datasource: DataSource,
              private spacesMailService: CnSpacesMailService,
              private objectStorageAggregateService: CnObjectStoragesAggregateService) {
  }

  public async getCurrentInfo(): Promise<CnUserSpaceInfo> {
    const user = this.userService.getCurrent();
    let space: CnSpace = CnCurrentUserHelper.getCurrentSpace();
    let role: CnSpaceUserRole = CnCurrentUserHelper.getCurrentRoleInSpace();
    if (!space) {
      space = await this.spaceUserService.getUserDefaultSpaceAndCheck(user.id);
    }

    if (!role) {
      const spaceUser = await this.spaceUserService.findOneBySpaceIdAndUserId(space.id, user.id);
      role = spaceUser.role;
    }

    return new CnUserSpaceInfo(user, space, role);
  }

  public async getCurrentSpaceSettings(): Promise<CnSpaceSettingsDto> {
    return this.getSpaceSettings(CnCurrentUserHelper.getAndCheckCurrentSpace().id);
  }

  public async getSpaceSettings(spaceId: string): Promise<CnSpaceSettingsDto> {
    const space = await this.spaceService.findByIdAndCheck(spaceId, {
      defaultProjectBucket: CnBucket.configRelation,
      defaultProjectBackupBucket: CnBucket.configRelation
    });

    return CnSpaceSettingsDto.fromSpace(space);
  }

  public async createBasicSpace(entity: CnSaveSpaceDTO): Promise<CnSpaceSettingsDto> {
    let space = await this.checkSpaceSave(entity);

    await this.datasource.transaction(async (entityManager: EntityManager) => {

      space = await this.spaceService.createBasicSpace(space, entityManager);

      const user = CnCurrentUserHelper.getAndCheckCurrentUser();
      await this.spaceUserService.addUserToSpace(space, user, CnSpaceUserRole.ADMIN, user, entityManager);

    });
    return this.getSpaceSettings(space.id);
  }

  public async update(entity: CnSaveSpaceDTO): Promise<CnSpaceSettingsDto> {
    await this.checkSpaceAdmin(entity.id);
    const space = await this.checkSpaceSave(entity);
    const dbSpace = await this.spaceService.update(space);
    return this.getSpaceSettings(dbSpace.id);
  }

  private async checkSpaceSave(spaceDTO: CnSaveSpaceDTO): Promise<CnSpace> {

    const space = new CnSpace();
    space.id = spaceDTO.id;
    space.name = spaceDTO.name;

    // if the user is not admin, he can't set the nb of licenses
    if (CnCurrentUserHelper.getAndCheckCurrentUser().isAdmin()) {
      space.nbLicenses = spaceDTO.nbLicenses;
    }

    if (!spaceDTO.defaultProjectStorageLocation) {
      throw new BlBadRequestException('The default project storage is required for space');
    }


    if (spaceDTO.defaultProjectStorageLocation) {
      space.defaultProjectBucket = await this.objectStorageAggregateService.getBucketByIdNotSecure(
        spaceDTO.defaultProjectStorageLocation.bucketId);
    }

    if (spaceDTO.defaultProjectBackupStorageLocation) {
      space.defaultProjectBackupBucket = await this.objectStorageAggregateService.getBucketByIdNotSecure(
        spaceDTO.defaultProjectBackupStorageLocation.bucketId);
    } else {
      space.defaultProjectBackupBucket = null;
    }

    // if this is created mode
    if (space.id == null) {
      if (space.defaultProjectBucket.isLabBucket() || space.defaultProjectBackupBucket?.isLabBucket()) {
        throw new BlBadRequestException('The default project storage and backup storage can\'t be a lab bucket during creation');
      }
    } else {
      if (space.defaultProjectBucket.isLabBucket() && space.defaultProjectBucket.labInstance.spaceId !== space.id) {
        throw new BlBadRequestException('The default project backup storage lab must be in the same space');
      }

      if (space.defaultProjectBackupBucket?.isLabBucket() && space.defaultProjectBackupBucket
        && space.defaultProjectBackupBucket.labInstance.spaceId !== space.id) {
        throw new BlBadRequestException('The default project backup storage lab must be in the same space');
      }
    }

    return space;
  }

  public async delete(id: string): Promise<void> {
    await this.checkSpaceAdmin(id);

    const space = await this.spaceService.findByIdAndCheck(id);

    if (space.type === CnSpaceType.PERSONAL) {
      throw new BlBadRequestException('Can\'t delete personal space');
    }

    const users = await this.getUsersOfSpace(id, 0, 1);

    if (users.totalElements > 0) {
      throw new BlBadRequestException('Can\'t delete the space because there are users in the space');
    }
    await this.spaceService.deleteById(id);
  }

  public async getSpacesOfUser(userId: string): Promise<CnSpace[]> {
    this.checkAdmin();
    return await this.spaceUserService.getSpacesOfUser(userId);
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

  public async searchUserInSpace(id: string, searchParams: BlSearchParams, page: number, size: number): Promise<ClPage<CnSpaceUser>> {
    id = this.getSpaceId(id);
    await this.checkSpaceMember(id);

    return this.spaceUserService.searchUser(id, searchParams, page, size);
  }

  public async searchUserInSpaceByName(id: string, name: string, page: number, size: number): Promise<ClPage<CnUser>> {
    id = this.getSpaceId(id);
    await this.checkSpaceMember(id);

    const result = await this.spaceUserService.smartSearchByName(id, name, page, size);
    return result.map((spaceUser: CnSpaceUser) => spaceUser.user);
  }

  public async getAll(page: number, size: number): Promise<ClPage<CnSpace>> {
    this.checkAdmin();

    return this.spaceService.getAll(page, size);
  }

  public async search(searchParams: BlSearchParams, page: number, size: number): Promise<ClPage<CnSpace>> {
    this.checkAdmin();

    return this.spaceService.search(searchParams, page, size);
  }

  public async searchByName(name: string, page: number, size: number): Promise<ClPage<CnSpace>> {
    this.checkAdmin();

    return this.spaceService.searchByName(name, page, size);
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

  public async sendAllSpaceUsersToQueue(): Promise<void>{
    this.checkAdmin();

    await this.spaceUserService.sendAllSpaceUsersToQueue();
  }

  public async sendAllSpaceUsersFromASpaceToQueue(spaceId: string): Promise<void>{
    await this.checkSpaceAdmin(spaceId);

    await this.spaceUserService.sendAllSpaceUsersFromASpaceToQueue(spaceId);
  }


  /**
   * Directly add a user to an space. Only accessible by G admins.
   */
  public async addUserToSpace(spaceID: string, userId: string): Promise<CnSpaceUser> {
    this.checkAdmin();

    spaceID = this.getSpaceId(spaceID);
    const user = await this.userService.findByIdAndCheck(userId);
    const space = await this.spaceService.findByIdAndCheck(spaceID);

    return await this.spaceUserService.addUserToSpace(space, user, CnSpaceUserRole.USER, CnCurrentUserHelper.getAndCheckCurrentUser());
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

  public async getInvitationByCode(code: string): Promise<CnSpaceInvitReadDto> {
    const invit = await this.invitationService.findByCodeAndCheckValidity(code);

    const user = await this.userService.findByEmail(invit.userMail);
    return {
      invitation: invit,
      existingUser: user
    };
  }

  public async inviteUserToSpace(spaceId: string, invitDto: CnSpaceInvitCreateDto): Promise<CnSpaceInvit> {
    spaceId = this.getSpaceId(spaceId);
    await this.checkSpaceAdmin(spaceId);

    const space = await this.spaceService.findByIdAndCheck(spaceId);

    const member = await this.spaceUserService.findOneBySpaceIdAndUserEmail(
      spaceId, invitDto.userMail);

    if (member) {
      throw new BlBadRequestException(CnErrorText.USER_ALREADY_IN_SPACE);
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
   * Method called when a user accepted an invitation and already has an account
   */
  public async existingUserAcceptsInvitation(code: string): Promise<CnUser> {
    const invitation = await this.findInvitationByCodeAndCheckValidity(code);

    const user = await this.userService.findByEmail(invitation.userMail);
    if (user == null) {
      throw new BlBadRequestException('User not found');
    }

    return await this.datasource.transaction(async (transaction) => {
      return await this.acceptInvitation(invitation, user, transaction);
    });
  }

  public async findInvitationByCodeAndCheckValidity(code: string): Promise<CnSpaceInvit> {
    return await this.invitationService.findByCodeAndCheckValidity(code);
  }


  public async acceptInvitation(invitation: CnSpaceInvit, user: CnUser,
                                entityManager: EntityManager): Promise<CnUser> {
    if (invitation.userMail !== user.email) {
      throw new BlBadRequestException('The invitation email does not match the user email');
    }

    await this.spaceUserService.addUserToSpace(invitation.space, user, invitation.role, invitation.createdBy,
      entityManager);

    await this.invitationService.deleteById(invitation.id, entityManager);

    return user;
  }

  public async findInvitationsBySpaceId(spaceId: string, page: number,
                                        pageSize: number): Promise<ClPage<CnSpaceInvit>> {
    spaceId = this.getSpaceId(spaceId);
    await this.checkSpaceAdmin(spaceId);

    return this.invitationService.findInvitationsBySpaceId(spaceId, page, pageSize);
  }


  /////////////////////////////////////// OTHERS //////////////////////////////////

  public async requestNewLicenses(spaceId: string, request: CnRequestNewLicensesDto): Promise<void> {
    const userInfo = CnCurrentUserHelper.getAndCheckUserSpaceInfo();
    await this.checkSpaceAdmin(userInfo.spaceId);

    await this.spacesMailService.requestNewLicenses(request, userInfo);
  }

  public async createPersonalSpace(user: CnUser, entityManager: EntityManager): Promise<CnSpace> {
    const defaultProjectBucket = await this.objectStorageAggregateService.getDefaultProjectBucketStorage1();
    const defaultProjectBackupBucket = await this.objectStorageAggregateService.getDefaultProjectBucketStorage2();
    const personalSpace = await this.spaceService.createPersonalSpace(user, defaultProjectBucket,
      defaultProjectBackupBucket, entityManager);

    await this.spaceUserService.addUserToSpace(personalSpace, user, CnSpaceUserRole.ADMIN,
      user, entityManager);

    return personalSpace;
  }

  /////////////////////////////////////// SECURITY //////////////////////////////////


  private async checkSpaceMember(spaceId: string): Promise<void> {
    await this.spaceAggregateSecurity.checkIsSpaceMember(spaceId, CnCurrentUserHelper.getCurrentUser());
  }

  private async checkSpaceAdmin(spaceId: string): Promise<void> {
    this.spaceAggregateSecurity.checkIsSpaceAdmin(spaceId, CnCurrentUserHelper.getCurrentUser());
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

  /////////////////////////////////////// ADMIN MANAGEMENT ROUTES //////////////////////////////////

  public async generateAllUserPersonalSpace(): Promise<void> {
    this.checkAdmin();

    const users = await this.userService.findAll();
    for (const user of users) {
      // create the user personal space if it does not exist
      const space = await this.spaceUserService.getUserDefaultSpace(user.id);
      if (space == null) {
        await this.createPersonalSpace(user, this.datasource.manager);
      }
    }

  }

  public async getAndCheckUser(userId: string): Promise<CnUser> {
    if (CnCurrentUserHelper.isAdmin() ||
      await this.spaceUserService.usersHaveCommonSpace(userId, this.userService.getCurrent().id)) {
      return this.userService.findByIdAndCheck(userId);
    }

    throw new BlBadRequestException(CnErrorText.USER_NOT_IN_SPACE);
  }

}
