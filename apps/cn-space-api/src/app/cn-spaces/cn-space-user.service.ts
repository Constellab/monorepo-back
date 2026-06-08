import {
  BL_TRANSPORT_SPACE_SPACE_USER_QUEUE,
  BlAbstractPaginatedService,
  BlBadRequestException,
  BlSearchBuilder,
  BlSearchParams,
  BlTransportSpaceUserCreateOrUpdatePayload,
  BlTransportSpaceUserPattern,
  BlTransportSpaceUserRemovePayload,
} from '@monorepo/back-core-lib';
import { ClHelpService, ClPage } from '@monorepo/core-lib';
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bullmq';
import { EntityManager, Repository } from 'typeorm';

import { CnErrorText } from '../cn-core/model/config/cn-error-text.class';
import { CnUser } from '../cn-users/cn-user.entity';
import { CnSpace, CnSpaceEntity, CnSpaceType } from './cn-space.entity';
import { CnSpaceUser, CnSpaceUserEntity, CnSpaceUserRole, CnSpaceUserWithUser } from './cn-space-user.entity';
import { CnSpaceUserSearch } from './cn-space-user-search.class';

@Injectable()
export class CnSpaceUserService extends BlAbstractPaginatedService<CnSpaceUserEntity> {
  private readonly logger = new Logger(CnSpaceUserService.name);
  constructor(
    @InjectRepository(CnSpaceUserEntity) private repository: Repository<CnSpaceUserEntity>,
    @InjectQueue(BL_TRANSPORT_SPACE_SPACE_USER_QUEUE) private queue: Queue
  ) {
    super(repository, CnSpaceUserEntity);
  }

  public async userIsSpaceMember(spaceId: string, userId: string): Promise<boolean> {
    return (await this.findOneBySpaceIdAndUserId(spaceId, userId)) != null;
  }

  /**
   * Check if the user has access to the space and return the space user if he has access.
   * If the user does not have access, return null.
   * @param spaceId
   * @param userId
   */
  public async getSpaceUserIfAccess(spaceId: string, userId: string): Promise<CnSpaceUser | null> {
    const spaceUser = await this.findOneBySpaceIdAndUserId(spaceId, userId);
    if (spaceUser != null && spaceUser.active) {
      return spaceUser;
    } else {
      return null;
    }
  }

  public async addUserToSpace(
    space: CnSpace,
    user: CnUser,
    role: CnSpaceUserRole,
    addedBy: CnUser,
    entityManager?: EntityManager
  ): Promise<CnSpaceUserEntity> {
    if (await this.userIsSpaceMember(space.id, user.id)) {
      throw new BlBadRequestException(CnErrorText.USER_ALREADY_IN_SPACE);
    }

    if (space.isEntrepriseSpace() && user.isFreeLicence() && role !== CnSpaceUserRole.VIEWER) {
      throw new BlBadRequestException(CnErrorText.USER_FREE_LICENCE_ENTREPRISE_SPACE_ERROR);
    }

    // for personal space check if the space already has 3 users
    if (space.isPersonalSpace()) {
      await this.checkPersonalSpaceUserLimit(space.id);
    }

    const spaceUser = new CnSpaceUserEntity();
    spaceUser.user = user;
    spaceUser.space = space;
    spaceUser.role = role;
    spaceUser.active = true;
    spaceUser.addedBy = addedBy;
    const spaceUserSaved = await this.getEntityManager(entityManager).save(spaceUser);

    if (!spaceUserSaved.isSpaceViewer()) {
      this.sendSpaceUserToTransport(spaceUserSaved);
    }

    return spaceUserSaved;
  }

  public async checkPersonalSpaceUserLimit(spaceId: string): Promise<void> {
    const spaceUsers = await this.repository.find({ where: { spaceId: spaceId } });
    if (spaceUsers.length >= CnSpaceEntity.PERSONAL_SPACE_USER_LIMIT) {
      throw new BlBadRequestException(CnErrorText.PERSONAL_SPACE_USER_LIMIT, {
        detailArgs: { limit: CnSpaceEntity.PERSONAL_SPACE_USER_LIMIT },
      });
    }
  }

  public async removeUserFromSpace(
    spaceId: string,
    userId: string,
    entityManager?: EntityManager
  ): Promise<void> {
    if (!(await this.userIsSpaceMember(spaceId, userId))) {
      throw new BlBadRequestException(CnErrorText.USER_NOT_IN_SPACE);
    }
    await this.getEntityManager(entityManager).delete(CnSpaceUserEntity, {
      userId: userId,
      spaceId: spaceId,
    });

    this.sendRemoveSpaceUserToTransport(userId, spaceId);
  }

  public async activateUser(spaceId: string, userId: string): Promise<CnSpaceUser> {
    const spaceUser = await this.findOneBySpaceIdAndUserId(spaceId, userId);

    if (spaceUser.active) {
      throw new BlBadRequestException('The user is already active');
    }
    spaceUser.active = true;
    const spaceUserSave = await this.repository.save(spaceUser);
    if (!spaceUserSave.isSpaceViewer()) {
      this.sendUpdateSpaceUserToTransport(spaceUserSave);
    }
    return spaceUserSave;
  }

  public async deactivateUser(spaceId: string, userId: string): Promise<CnSpaceUser> {
    const spaceUser = await this.findOneBySpaceIdAndUserId(spaceId, userId);

    if (!spaceUser.active) {
      throw new BlBadRequestException('The user is already inactive');
    }
    spaceUser.active = false;
    const spaceUserSave = await this.repository.save(spaceUser);
    if (!spaceUserSave.isSpaceViewer()) {
      this.sendUpdateSpaceUserToTransport(spaceUserSave);
    }
    return spaceUserSave;
  }

  public async updateUserRole(
    spaceId: string,
    userId: string,
    role: CnSpaceUserRole,
    entityManager?: EntityManager
  ): Promise<CnSpaceUser> {
    const spaceUser = await this.findOneBySpaceIdAndUserId(spaceId, userId);

    if (spaceUser.role === role) {
      throw new BlBadRequestException('The user already has the role ' + role);
    }

    const wasViewer = spaceUser.isSpaceViewer();
    spaceUser.role = role;
    const spaceUserSave = await this.getEntityManager(entityManager).save(CnSpaceUserEntity, spaceUser);

    if (spaceUserSave.isSpaceViewer()) {
      // Downgraded to VIEWER: remove from community
      this.sendRemoveSpaceUserToTransport(spaceUserSave.userId, spaceUserSave.spaceId);
    } else if (wasViewer) {
      // Upgraded from VIEWER: create in community
      await this.sendSpaceUserToTransportFromId(spaceUserSave.userId, spaceUserSave.spaceId);
    } else {
      // Regular role change (ADMIN <-> USER): update in community
      this.sendUpdateSpaceUserToTransport(spaceUserSave);
    }

    return spaceUserSave;
  }

  public async getSpaceAdmins(spaceId: string): Promise<CnSpaceUser[]> {
    return this.repository.find({ where: { spaceId: spaceId, role: CnSpaceUserRole.ADMIN } });
  }

  /**
   * Return true if the user is the only admin of the space
   */
  public async isOnlyAdmin(spaceId: string, userId: string): Promise<boolean> {
    const admins = await this.getSpaceAdmins(spaceId);
    return admins.length === 1 && admins[0].userId === userId;
  }

  public async usersHaveCommonSpace(userAId: string, userBId: string): Promise<boolean> {
    const userASpaces: CnSpace[] = await this.getSpacesOfUser(userAId);
    const userBSpaces: CnSpace[] = await this.getSpacesOfUser(userBId);

    //Check common space
    return userASpaces.find((space) => userBSpaces.find((spaceB) => spaceB.id === space.id)) != null;
  }

  ///////////////////////////////// FIND  /////////////////////////////////////////
  public async findOneBySpaceIdAndUserId(
    spaceId: string,
    userId: string
  ): Promise<CnSpaceUserWithUser | null> {
    return this.repository.findOne({ where: { userId, spaceId: spaceId }, relations: { user: true } });
  }

  public async findOneBySpaceIdAndUserEmail(
    spaceId: string,
    email: string
  ): Promise<CnSpaceUserWithUser | null> {
    return this.repository.findOne({
      where: {
        spaceId: spaceId,
        user: { email: email },
      },
      relations: { user: true },
    });
  }

  public async findBySpace(
    spaceId: string,
    page: number,
    size: number
  ): Promise<ClPage<CnSpaceUserWithUser>> {
    return await this.findPaginated(page, size, {
      where: { spaceId: spaceId },
      relations: { user: true },
    });
  }

  public async searchUser(
    spaceId: string,
    searchParams: BlSearchParams,
    page: number,
    size: number
  ): Promise<ClPage<CnSpaceUserWithUser>> {
    const searchBuilder = new BlSearchBuilder<CnSpaceUserWithUser>();
    searchBuilder.addSearchParams(searchParams);
    searchBuilder.mergeWhereOptions({ spaceId: spaceId });
    searchBuilder.setRelations({ user: true });

    return await this.findPaginated(page, size, searchBuilder.build());
  }

  public async findAllSpaceUserIds(spaceId: string): Promise<string[]> {
    const spaceUsers = await this.repository.find({
      where: { spaceId: spaceId },
    });
    return spaceUsers.map((spaceUser) => spaceUser.userId);
  }

  public async getSpacesOfUser(userId: string): Promise<CnSpace[]> {
    const spaceUsers = await this.repository.find({ where: { userId }, relations: { space: true } });
    return spaceUsers.map((spaceUser) => spaceUser.space);
  }

  public async getUserPersonalSpaceAndCheck(userId: string): Promise<CnSpace> {
    const space = await this.getUserPersonalSpace(userId);
    if (space == null) {
      throw new BlBadRequestException(CnErrorText.USER_WITHOUT_SPACE);
    }

    return space;
  }

  public async getUserPersonalSpace(userId: string): Promise<CnSpace | null> {
    const spaceUser = await this.repository.findOne({
      where: {
        userId: userId,
        space: { type: CnSpaceType.PERSONAL },
        role: CnSpaceUserRole.ADMIN,
      },
      relations: { space: true },
    });

    if (spaceUser == null) return null;
    return spaceUser.space;
  }

  ///////////////////////////////// SEARCH BY NAME /////////////////////////////////////////

  // Search by name
  public async smartSearchByName(
    spaceId: string,
    name: string,
    page: number,
    size: number
  ): Promise<ClPage<CnSpaceUserWithUser>> {
    if (ClHelpService.isNullOrEmpty(name)) {
      return this.findBySpace(spaceId, page, size);
    }

    const userSearch = new CnSpaceUserSearch(this, spaceId);
    return userSearch.smartSearchByName(name, page, size);
  }

  ///////////////////////////////// QUEUE /////////////////////////////////////////
  public async sendAllSpaceUsersToQueue(): Promise<void> {
    const spaceUsers = await this.repository.find({ relations: { user: true, space: true } });

    spaceUsers
      .filter((spaceUser) => !spaceUser.isSpaceViewer())
      .forEach((spaceUser) => {
        this.sendSpaceUserToTransport(spaceUser);
      });
  }

  public async sendAllSpaceUsersFromASpaceToQueue(spaceId: string): Promise<void> {
    const spaceUsers = await this.repository.find({
      where: { spaceId: spaceId },
      relations: { user: true, space: true },
    });
    spaceUsers
      .filter((spaceUser) => !spaceUser.isSpaceViewer())
      .forEach((spaceUser) => {
        this.sendSpaceUserToTransport(spaceUser);
      });
  }

  public async sendSpaceUserToTransportFromId(userId: string, spaceId: string): Promise<void> {
    const spaceUser = await this.repository.findOne({
      where: { spaceId: spaceId, userId: userId },
      relations: { user: true, space: true },
    });
    if (spaceUser) {
      this.sendSpaceUserToTransport(spaceUser);
    } else {
      this.logger.warn(
        `Space user with id ${userId} and space id ${spaceId} not found, cannot send to transport`
      );
    }
  }

  public sendSpaceUserToTransport(spaceUser: CnSpaceUserEntity): void {
    const payload = this.toCreateOrUpdatePayload(spaceUser);
    this.queue.add(BlTransportSpaceUserPattern.CREATE, payload).catch((err) => {
      this.logger.error('Error adding space user to queue', err);
    });
  }

  public sendRemoveSpaceUserToTransport(userId: string, spaceId: string): void {
    const payload: BlTransportSpaceUserRemovePayload = {
      userId,
      spaceId,
    };
    this.queue.add(BlTransportSpaceUserPattern.REMOVE, payload).catch((err) => {
      this.logger.error('Error sending remove space user to queue', err);
    });
  }

  public sendUpdateSpaceUserToTransport(spaceUser: CnSpaceUserEntity): void {
    const payload = this.toCreateOrUpdatePayload(spaceUser);
    this.queue.add(BlTransportSpaceUserPattern.UPDATE, payload).catch((err) => {
      this.logger.error('Error sending update space user to queue', err);
    });
  }

  private toCreateOrUpdatePayload(spaceUser: CnSpaceUserEntity): BlTransportSpaceUserCreateOrUpdatePayload {
    return {
      userId: spaceUser.userId,
      spaceId: spaceUser.spaceId,
      role: spaceUser.role,
      active: spaceUser.active,
      user: spaceUser.user,
      space: spaceUser.space,
      addedBy: spaceUser.addedBy,
      createdAt: spaceUser.createdAt,
    };
  }
}
