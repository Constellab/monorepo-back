import { BlBadRequestException, BlFile, BlFileResponse, BlSearchParams } from '@monorepo/back-core-lib';
import { ClPage } from '@monorepo/core-lib';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DataSource, EntityManager } from 'typeorm';

import { CnErrorText } from '../cn-core/model/config/cn-error-text.class';
import { CnCurrentUserHelper } from '../cn-core/utils/cn-current-user.helper';
import { CnDocumentService } from '../cn-folders-aggregate/cn-documents/cn-document.service';
import { CnFolderStorageUsageDTO } from '../cn-folders-aggregate/cn-documents/cn-document-dto.class';
import { CnBucket, CnBucketLocationDTO } from '../cn-object-storages/cn-buckets/cn-bucket.entity';
import { CnObjectStoragesAggregateService } from '../cn-object-storages/cn-object-storages-aggregate.service';
import { CnUserSpaceInfo } from '../cn-users/cn-user.dto';
import { CnUser } from '../cn-users/cn-user.entity';
import { CnUsersService } from '../cn-users/cn-users.service';
import {
  CnCreateSpaceDTO,
  CnRequestNewLicensesDto,
  CnSpaceInvitCreateDto,
  CnSpaceInvitReadDto,
  CnSpaceSettingsDto,
  CnSpaceStorage,
  CnSpaceUpdateStorageLocationDTO,
} from './cn-space.dto';
import { CnSpace, CnSpaceEntity, CnSpaceType } from './cn-space.entity';
import { CnSpaceEvent, cnSpaceEventName } from './cn-space.event';
import { CnSpaceService } from './cn-space.service';
import { CnSpaceAggregateSecurity } from './cn-space-aggregate-security.service';
import { CnSpaceInvit } from './cn-space-invit.entity';
import { CnSpaceInvitService } from './cn-space-invit.service';
import { CnSpaceUserRole, CnSpaceUserWithUser } from './cn-space-user.entity';
import { CnSpaceUserService } from './cn-space-user.service';
import { CnSpacesMailService } from './cn-spaces-mail.service';

@Injectable()
export class CnSpaceAggregateService {
  constructor(
    private spaceService: CnSpaceService,
    private spaceUserService: CnSpaceUserService,
    private spaceAggregateSecurity: CnSpaceAggregateSecurity,
    private invitationService: CnSpaceInvitService,
    private userService: CnUsersService,
    private datasource: DataSource,
    private spacesMailService: CnSpacesMailService,
    private objectStorageAggregateService: CnObjectStoragesAggregateService,
    private documentService: CnDocumentService,
    private eventEmitter: EventEmitter2
  ) {}

  public async getCurrentInfo(): Promise<CnUserSpaceInfo> {
    const user = this.userService.getAndCheckCurrentUser();
    let space = CnCurrentUserHelper.getCurrentSpace();
    if (!space) {
      // use the default space for the user
      space = await this.getUserDefaultSpaceAndCheck(user);
    }

    let role: CnSpaceUserRole = CnCurrentUserHelper.getCurrentRoleInSpace();
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
    const space = await this.spaceService.findByIdAndCheckWithBucket(spaceId);
    return CnSpaceSettingsDto.fromSpace(space);
  }

  public async getCurrentSpace(): Promise<CnSpaceEntity> {
    return this.spaceService.findByIdAndCheckWithBucket(CnCurrentUserHelper.getAndCheckCurrentSpace().id);
  }

  public async createEntrepriseSpace(entity: CnCreateSpaceDTO): Promise<CnSpaceSettingsDto> {
    // free licenced users can't create a space
    if (CnCurrentUserHelper.getAndCheckCurrentUser().isFreeLicence()) {
      throw new BlBadRequestException("Free licenced users can't create an entreprise space");
    }

    const bucketStorage = await this.checkSpaceStorage(
      entity.defaultStorageLocations.defaultFolderStorageLocation,
      entity.defaultStorageLocations.defaultFolderBackupStorageLocation
    );

    if (
      bucketStorage.defaultFolderBucket.isLabBucket() ||
      bucketStorage.defaultFolderBackupBucket?.isLabBucket()
    ) {
      throw new BlBadRequestException(
        "The default folder storage and backup storage can't be a lab bucket during creation"
      );
    }

    const spaceDB = await this.datasource.transaction(async (entityManager: EntityManager) => {
      const space = await this.spaceService.createEntrepriseSpace(
        entity.name,
        bucketStorage.defaultFolderBucket,
        bucketStorage.defaultFolderBackupBucket,
        entityManager
      );

      const user = CnCurrentUserHelper.getAndCheckCurrentUser();
      await this.spaceUserService.addUserToSpace(space, user, CnSpaceUserRole.ADMIN, user, entityManager);

      return space;
    });
    return this.getSpaceSettings(spaceDB.id);
  }

  public async updateCurrentSpaceName(name: string): Promise<CnSpace> {
    const space = CnCurrentUserHelper.getAndCheckCurrentSpace();
    await this.checkSpaceAdmin(space.id);
    space.name = name;
    return await this.spaceService.update(space as CnSpaceEntity);
  }

  public async delete(id: string): Promise<void> {
    await this.checkSpaceAdmin(id);

    const space = await this.spaceService.findByIdAndCheck(id);

    if (space.type === CnSpaceType.PERSONAL) {
      throw new BlBadRequestException("Can't delete personal space");
    }

    const users = await this.getUsersOfSpace(id, 0, 1);

    if (users.totalElements > 1) {
      throw new BlBadRequestException("Can't delete the space because there are users in the space");
    }
    await this.spaceService.deleteById(id);
  }

  public async findOne(id: string): Promise<CnSpace> {
    id = this.getSpaceId(id);
    await this.checkSpaceMember(id);
    return this.spaceService.findByIdAndCheck(id);
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
    const updatedSpace = await this.spaceService.uploadPhoto(space, file);
    await this.sendAllSpaceUsersFromASpaceToQueue(spaceId);
    return updatedSpace;
  }

  public async deleteSpacePhoto(spaceId: string): Promise<CnSpace> {
    spaceId = this.getSpaceId(spaceId);
    await this.checkSpaceAdmin(spaceId);

    const space = await this.spaceService.findByIdAndCheck(spaceId);
    const updatedSpace = await this.spaceService.deletePhoto(space);
    await this.sendAllSpaceUsersFromASpaceToQueue(spaceId);
    return updatedSpace;
  }

  public async getPhoto(filename: string): Promise<BlFileResponse> {
    return await this.spaceService.getPhoto(filename);
  }

  //////////////////////////////////////// LICENCE  ////////////////////////////////////////
  public async requestNewLicenses(request: CnRequestNewLicensesDto): Promise<void> {
    const userInfo = CnCurrentUserHelper.getAndCheckUserSpaceInfo();
    await this.checkSpaceAdmin(userInfo.spaceId);

    await this.spacesMailService.requestNewLicenses(request, userInfo);
  }

  /////////////////////////////////////// STORAGE ///////////////////////////////////////
  public async getCurrentSpaceStorage(): Promise<CnSpaceStorage> {
    const spaceId = CnCurrentUserHelper.getAndCheckCurrentSpace().id;
    await this.checkSpaceAdmin(spaceId);

    const space = await this.spaceService.findByIdAndCheckWithBucket(spaceId);

    return new CnSpaceStorage(
      space.cloudStorageLimit,
      space.cloudStorageUsage,
      space.defaultFolderBucket.getBucketLocation(),
      space.defaultFolderBackupBucket?.getBucketLocation() ?? null
    );
  }

  public async refreshSpaceStorageUsage(spaceId: string): Promise<void> {
    // TODO the calculation does not count the backup storage
    // it should not use the bucketType of documents but calculate it based on storage
    const storageUsage = await this.documentService.getSpaceCloudStorageSize(spaceId);
    await this.spaceService.updatePartial(spaceId, { cloudStorageUsage: storageUsage });
  }

  public async getCurrentSpaceStorageUsageDetail(): Promise<CnFolderStorageUsageDTO> {
    const space = CnCurrentUserHelper.getAndCheckCurrentSpace();
    await this.checkSpaceAdmin(space.id);

    return await this.documentService.getStorageSizeDetailBySpace(space.id);
  }

  public async updateCurrentSpaceStorageLocation(
    locationDTO: CnSpaceUpdateStorageLocationDTO
  ): Promise<CnSpaceStorage> {
    const space: CnSpaceEntity = CnCurrentUserHelper.getAndCheckCurrentSpace() as CnSpaceEntity;
    await this.checkSpaceAdmin(space.id);

    const buckets = await this.checkSpaceStorage(
      locationDTO.defaultFolderStorageLocation,
      locationDTO.defaultFolderBackupStorageLocation
    );

    // if this is created mode
    if (buckets.defaultFolderBucket.isLabBucket() && buckets.defaultFolderBucket.lab.spaceId !== space.id) {
      throw new BlBadRequestException('The default folder backup storage lab must be in the same space');
    }

    if (
      buckets.defaultFolderBackupBucket &&
      buckets.defaultFolderBackupBucket.isLabBucket() &&
      buckets.defaultFolderBackupBucket.lab.spaceId !== space.id
    ) {
      throw new BlBadRequestException('The default folder backup storage lab must be in the same space');
    }

    space.defaultFolderBucket = buckets.defaultFolderBucket;
    space.defaultFolderBackupBucket = buckets.defaultFolderBackupBucket;
    await this.spaceService.update(space);

    return this.getCurrentSpaceStorage();
  }

  public async updateCurrentSpaceStorageLimit(storageLimit: number): Promise<CnSpaceStorage> {
    this.checkAdmin();

    const space = CnCurrentUserHelper.getAndCheckCurrentSpace();
    await this.spaceService.updateStorageLimit(space, storageLimit);
    return this.getCurrentSpaceStorage();
  }

  public async findCurrentUserSpaces(): Promise<CnSpace[]> {
    return await this.spaceUserService.getSpacesOfUser(CnCurrentUserHelper.getAndCheckCurrentUser().id);
  }

  public async getSpacesOfUser(userId: string): Promise<CnSpace[]> {
    this.checkAdmin();
    return await this.spaceUserService.getSpacesOfUser(userId);
  }

  /////////////////////////////////////// USERS ///////////////////////////////////////

  public async getUsersOfSpace(id: string, page: number, size: number): Promise<ClPage<CnSpaceUserWithUser>> {
    id = this.getSpaceId(id);
    await this.checkSpaceMember(id);
    return this.spaceUserService.findBySpace(id, page, size);
  }

  public async searchUserInSpace(
    id: string,
    searchParams: BlSearchParams,
    page: number,
    size: number
  ): Promise<ClPage<CnSpaceUserWithUser>> {
    id = this.getSpaceId(id);
    await this.checkSpaceMember(id);

    return this.spaceUserService.searchUser(id, searchParams, page, size);
  }

  public async searchUserInSpaceByName(
    id: string,
    name: string,
    page: number,
    size: number
  ): Promise<ClPage<CnUser>> {
    id = this.getSpaceId(id);
    await this.checkSpaceMember(id);

    const result = await this.spaceUserService.smartSearchByName(id, name, page, size);
    return result.map((spaceUser) => spaceUser.user);
  }

  public async sendAllSpaceUsersToQueue(): Promise<void> {
    this.checkAdmin();

    await this.spaceUserService.sendAllSpaceUsersToQueue();
  }

  public async sendAllSpaceUsersFromASpaceToQueue(spaceId: string): Promise<void> {
    await this.checkSpaceAdmin(spaceId);

    await this.spaceUserService.sendAllSpaceUsersFromASpaceToQueue(spaceId);
  }

  /**
   * Directly add a user to an space. Only accessible by G admins.
   */
  public async addUserToSpace(spaceID: string, userId: string): Promise<CnSpaceUserWithUser> {
    this.checkAdmin();

    spaceID = this.getSpaceId(spaceID);
    const user = await this.userService.findByIdAndCheck(userId);
    const space = await this.spaceService.findByIdAndCheck(spaceID);

    return await this.spaceUserService.addUserToSpace(
      space,
      user,
      CnSpaceUserRole.USER,
      CnCurrentUserHelper.getAndCheckCurrentUser()
    );
  }

  public async removeUserFromSpace(spaceId: string, userId: string): Promise<void> {
    spaceId = this.getSpaceId(spaceId);
    // if a normal user tries to remove the last admin of the space, an error is thrown
    if (
      (await this.spaceUserService.isOnlyAdmin(spaceId, userId)) &&
      !CnCurrentUserHelper.getAndCheckCurrentUser().isAdmin()
    ) {
      throw new Error(CnErrorText.CANNOT_REMOVE_LAST_ADMIN);
    }

    await this.checkSpaceAdmin(spaceId);
    const user = await this.userService.findByIdAndCheck(userId);

    // trigger the event and check if the user can be removed
    await this.emitSpaceEventAndCheckResult({
      type: 'REMOVE_USER_FROM_SPACE',
      userId: user.id,
      spaceId: spaceId,
    });

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
    if (
      (await this.spaceUserService.isOnlyAdmin(spaceId, userId)) &&
      !CnCurrentUserHelper.getAndCheckCurrentUser().isAdmin()
    ) {
      throw new Error(CnErrorText.CANNOT_DEACTIVATE_LAST_ADMIN);
    }

    await this.spaceUserService.deactivateUser(spaceId, userId);
  }

  public async updateUserRoleInSpace(spaceId: string, userId: string, role: CnSpaceUserRole): Promise<void> {
    spaceId = this.getSpaceId(spaceId);
    if (
      role === CnSpaceUserRole.USER &&
      (await this.spaceUserService.isOnlyAdmin(spaceId, userId)) &&
      !CnCurrentUserHelper.getAndCheckCurrentUser().isAdmin()
    ) {
      throw new Error(CnErrorText.CANNOT_REMOVE_LAST_ADMIN);
    }

    await this.checkSpaceAdmin(spaceId);

    await this.spaceUserService.updateUserRole(spaceId, userId, role);
  }

  public async getInvitationByCode(code: string): Promise<CnSpaceInvitReadDto> {
    const invit = await this.invitationService.findByCodeAndCheckValidity(code);

    const user = await this.userService.findByEmail(invit.userMail);
    return {
      invitation: invit,
      existingUser: user,
    };
  }

  public async inviteUserToSpace(spaceId: string, invitDto: CnSpaceInvitCreateDto): Promise<CnSpaceInvit> {
    spaceId = this.getSpaceId(spaceId);
    await this.checkSpaceAdmin(spaceId);

    const space = await this.spaceService.findByIdAndCheck(spaceId);

    const member = await this.spaceUserService.findOneBySpaceIdAndUserEmail(spaceId, invitDto.userMail);

    if (member) {
      throw new BlBadRequestException(CnErrorText.USER_ALREADY_IN_SPACE);
    }

    // for entreprise space, only user with entreprise licence can be invited
    if (space.isEntrepriseSpace()) {
      const user = await this.userService.findByEmail(invitDto.userMail);

      if (user == null) {
        throw new BlBadRequestException(CnErrorText.INVIT_NONE_EXISTING_USER_TO_ENTREPRISE_SPACE_ERROR);
      }
      if (user.isFreeLicence()) {
        throw new BlBadRequestException(CnErrorText.INVIT_FREE_USER_TO_ENTREPRISE_SPACE_ERROR);
      }
    }

    if (space.isPersonalSpace()) {
      await this.spaceUserService.checkPersonalSpaceUserLimit(spaceId);
    }

    return this.invitationService.createInvitation(space, invitDto);
  }

  /////////////////////////////////////// INVITATION //////////////////////////////////

  public async resendInvitation(invitationId: string): Promise<void> {
    const invitation = await this.invitationService.findByIdAndCheck(invitationId, { space: true });
    await this.checkSpaceAdmin(invitation.spaceId);

    return this.invitationService.resendInvitation(invitation);
  }

  public async refreshInvitationValidUntil(invitationId: string): Promise<CnSpaceInvit> {
    const invitation = await this.invitationService.findByIdAndCheck(invitationId, { space: true });
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

  public async acceptInvitation(
    invitation: CnSpaceInvit,
    user: CnUser,
    entityManager: EntityManager
  ): Promise<CnUser> {
    if (invitation.userMail !== user.email) {
      throw new BlBadRequestException('The invitation email does not match the user email');
    }

    if (invitation.space.isEntrepriseSpace() && user.isFreeLicence()) {
      throw new BlBadRequestException(CnErrorText.INVIT_ACCEPT_USER_FREE_LICENCE_ENTREPRISE_SPACE);
    }

    await this.spaceUserService.addUserToSpace(
      invitation.space,
      user,
      invitation.role,
      invitation.createdBy,
      entityManager
    );

    await this.invitationService.deleteById(invitation.id, entityManager);

    return user;
  }

  public async findInvitationsBySpaceId(
    spaceId: string,
    page: number,
    pageSize: number
  ): Promise<ClPage<CnSpaceInvit>> {
    spaceId = this.getSpaceId(spaceId);
    await this.checkSpaceAdmin(spaceId);

    return this.invitationService.findInvitationsBySpaceId(spaceId, page, pageSize);
  }

  public async createPersonalSpace(user: CnUser, entityManager: EntityManager): Promise<CnSpace> {
    const defaultFolderBucket = await this.objectStorageAggregateService.getDefaultFolderBucketStorage1();
    const defaultFolderBackupBucket =
      await this.objectStorageAggregateService.getDefaultFolderBucketStorage2();
    const personalSpace = await this.spaceService.createPersonalSpace(
      user,
      defaultFolderBucket,
      defaultFolderBackupBucket,
      entityManager
    );

    await this.spaceUserService.addUserToSpace(
      personalSpace,
      user,
      CnSpaceUserRole.ADMIN,
      user,
      entityManager
    );

    return personalSpace;
  }

  public async deletePersonalSpace(userId: string, entityManager: EntityManager): Promise<void> {
    const personalSpace = await this.spaceUserService.getUserPersonalSpaceAndCheck(userId);

    if (personalSpace.type !== CnSpaceType.PERSONAL) {
      throw new BlBadRequestException('Cannot delete an enterprise space');
    }
    await this.spaceService.deleteById(personalSpace.id, entityManager);
  }

  public async getAndCheckUser(userId: string): Promise<CnUser> {
    if (
      CnCurrentUserHelper.isAdmin() ||
      (await this.spaceUserService.usersHaveCommonSpace(userId, this.userService.getAndCheckCurrentUser().id))
    ) {
      return this.userService.findByIdAndCheck(userId);
    }

    throw new BlBadRequestException(CnErrorText.USER_NOT_IN_SPACE);
  }

  /////////////////////////////////////// OTHERS //////////////////////////////////

  /**
   * Retrieve the default space of the user. If the user has a last connected space, it is returned,
   * otherwise the personal space of the user is returned.
   */
  private async getUserDefaultSpaceAndCheck(user: CnUser): Promise<CnSpace> {
    if (user.lastConnectedSpaceId) {
      const spaceUser = await this.spaceUserService.getSpaceUserIfAccess(user.lastConnectedSpaceId, user.id);
      // if the user still has access to the last connected space, return it
      if (spaceUser) {
        return await this.spaceService.findByIdAndCheck(user.lastConnectedSpaceId);
      }
    }
    return await this.spaceUserService.getUserPersonalSpaceAndCheck(user.id);
  }

  public async getUserPersonalSpaceAndCheck(userId: string): Promise<CnSpace> {
    return await this.spaceUserService.getUserPersonalSpaceAndCheck(userId);
  }

  public getSpaceUserIfAccess(spaceId: string, userId: string): Promise<CnSpaceUserWithUser | null> {
    return this.spaceUserService.findOneBySpaceIdAndUserId(spaceId, userId);
  }

  public async userHasAccessToSpace(spaceId: string, userId: string): Promise<boolean> {
    const spaceUser = await this.getSpaceUserIfAccess(spaceId, userId);
    return spaceUser !== null;
  }

  /////////////////////////////////////// SECURITY //////////////////////////////////

  private async checkSpaceStorage(
    defaultFolderStorageLocation: CnBucketLocationDTO,
    defaultFolderBackupStorageLocation?: CnBucketLocationDTO
  ): Promise<{
    defaultFolderBucket: CnBucket;
    defaultFolderBackupBucket: CnBucket | null;
  }> {
    if (defaultFolderStorageLocation.bucketId === defaultFolderBackupStorageLocation?.bucketId) {
      throw new BlBadRequestException(
        "The default folder storage and backup storage can't in the same location"
      );
    }

    let defaultBucket: CnBucket;
    let defaultBackupBucket: CnBucket | null;

    if (!defaultFolderStorageLocation) {
      throw new BlBadRequestException('The default folder storage is required for space');
    }

    if (defaultFolderStorageLocation) {
      defaultBucket = await this.objectStorageAggregateService.getBucketByIdNotSecure(
        defaultFolderStorageLocation.bucketId
      );
    }

    if (defaultFolderBackupStorageLocation) {
      defaultBackupBucket = await this.objectStorageAggregateService.getBucketByIdNotSecure(
        defaultFolderBackupStorageLocation.bucketId
      );
    } else {
      defaultBackupBucket = null;
    }

    if (defaultBucket && defaultBackupBucket) {
      if (defaultBucket.bucketType !== defaultBackupBucket.bucketType) {
        throw new BlBadRequestException('Use the same cloud provider for main and backup storage');
      }
    }

    return { defaultFolderBucket: defaultBucket, defaultFolderBackupBucket: defaultBackupBucket };
  }

  private async checkSpaceMember(spaceId: string): Promise<void> {
    await this.spaceAggregateSecurity.checkIsSpaceMember(
      spaceId,
      CnCurrentUserHelper.getAndCheckCurrentUser()
    );
  }

  private checkSpaceAdmin(spaceId: string): Promise<void> {
    return this.spaceAggregateSecurity.checkIsSpaceAdmin(
      spaceId,
      CnCurrentUserHelper.getAndCheckCurrentUser()
    );
  }

  private checkAdmin(): void {
    this.spaceAggregateSecurity.checkIsAdmin(CnCurrentUserHelper.getAndCheckCurrentUser());
  }

  /////////////////////////////////////// ADMIN MANAGEMENT ROUTES //////////////////////////////////

  /**
   * If the id is 'current', the id of the current space is returned.
   * @param spaceId
   * @private
   */
  private getSpaceId(spaceId: string): string {
    if (spaceId === 'current') return CnCurrentUserHelper.getAndCheckCurrentSpace().id;
    return spaceId;
  }

  //////////////////////////////// EVENT ///////////////////////////////////////

  private async emitSpaceEventAndCheckResult(event: CnSpaceEvent): Promise<void> {
    const results: string[] = await this.eventEmitter.emitAsync(cnSpaceEventName, event);
    // if a text is returned, it means an error occurred
    for (const res of results) {
      if (res) {
        throw new Error(res);
      }
    }
  }
}
