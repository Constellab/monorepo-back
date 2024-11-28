import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CnSpaceUser, CnSpaceUserRole } from './cn-space-user.entity';
import { EntityManager, Repository } from 'typeorm';
import { CnUser } from '../cn-users/cn-user.entity';
import { CnSpace, CnSpaceType } from './cn-space.entity';
import { CnErrorText } from '../cn-core/model/config/cn-error-text.class';
import { ClHelpService, ClPage } from '@monorepo/core-lib';
import {
  BlAbstractPaginatedService,
  BlBadRequestException,
  BlSearchBuilder,
  BlSearchParams,
  blTransportSpaceSpaceUserQueue,
  BlTransportSpaceUserPattern,
} from '@monorepo/back-core-lib';
import { CnSpaceUserSearch } from './cn-space-user-search.class';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';

@Injectable()
export class CnSpaceUserService extends BlAbstractPaginatedService<CnSpaceUser> {
  constructor(
    @InjectRepository(CnSpaceUser) private repository: Repository<CnSpaceUser>,
    @InjectQueue(blTransportSpaceSpaceUserQueue) private queue: Queue
  ) {
    super(repository, CnSpaceUser);
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
  ): Promise<CnSpaceUser> {
    if (await this.userIsSpaceMember(space.id, user.id)) {
      throw new BlBadRequestException(CnErrorText.USER_ALREADY_IN_SPACE);
    }

    if (space.isEntrepriseSpace() && user.isFreeLicence()) {
      throw new BlBadRequestException(CnErrorText.USER_FREE_LICENCE_ENTREPRISE_SPACE_ERROR);
    }

    // for personal space check if the space already has 3 users
    if (space.isPersonalSpace()) {
      await this.checkPersonalSpaceUserLimit(space.id);
    }

    const spaceUser = new CnSpaceUser();
    spaceUser.user = user;
    spaceUser.space = space;
    spaceUser.role = role;
    spaceUser.active = true;
    spaceUser.addedBy = addedBy;
    const spaceUserSaved = await this.getEntityManager(entityManager).save(spaceUser);

    this.sendSpaceUserToTransport(spaceUserSaved);

    return spaceUserSaved;
  }

  public async checkPersonalSpaceUserLimit(spaceId: string): Promise<void> {
    const spaceUsers = await this.repository.find({ where: { spaceId: spaceId } });
    if (spaceUsers.length >= CnSpace.PERSONAL_SPACE_USER_LIMIT) {
      throw new BlBadRequestException(CnErrorText.PERSONAL_SPACE_USER_LIMIT, {
        detailArgs: { limit: CnSpace.PERSONAL_SPACE_USER_LIMIT },
      });
    }
  }

  public async removeUserFromSpace(spaceId: string, userId: string): Promise<void> {
    if (!(await this.userIsSpaceMember(spaceId, userId))) {
      throw new BlBadRequestException(CnErrorText.USER_NOT_IN_SPACE);
    }
    await this.repository.delete({ userId: userId, spaceId: spaceId });

    const spaceUserDeleted = {
      userId: userId,
      spaceId: spaceId,
    };

    this.sendActionOnSpaceUserToTransport(spaceUserDeleted, BlTransportSpaceUserPattern.REMOVE);
  }

  public async activateUser(spaceId: string, userId: string): Promise<CnSpaceUser> {
    const spaceUser = await this.findOneBySpaceIdAndUserId(spaceId, userId);

    if (spaceUser.active) {
      throw new BlBadRequestException('The user is already active');
    }
    spaceUser.active = true;
    const spaceUserSave = await this.repository.save(spaceUser);
    this.sendActionOnSpaceUserToTransport(spaceUserSave, BlTransportSpaceUserPattern.UPDATE);
    return spaceUserSave;
  }

  public async deactivateUser(spaceId: string, userId: string): Promise<CnSpaceUser> {
    const spaceUser = await this.findOneBySpaceIdAndUserId(spaceId, userId);

    if (!spaceUser.active) {
      throw new BlBadRequestException('The user is already inactive');
    }
    spaceUser.active = false;
    const spaceUserSave = await this.repository.save(spaceUser);
    this.sendActionOnSpaceUserToTransport(spaceUserSave, BlTransportSpaceUserPattern.UPDATE);
    return spaceUserSave;
  }

  public async updateUserRole(spaceId: string, userId: string, role: CnSpaceUserRole): Promise<CnSpaceUser> {
    const spaceUser = await this.findOneBySpaceIdAndUserId(spaceId, userId);

    if (spaceUser.role === role) {
      throw new BlBadRequestException('The user already has the role ' + role);
    }

    spaceUser.role = role;
    const spaceUserSave = await this.repository.save(spaceUser);
    this.sendActionOnSpaceUserToTransport(spaceUserSave, BlTransportSpaceUserPattern.UPDATE);
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
  public async findOneBySpaceIdAndUserId(spaceId: string, userId: string): Promise<CnSpaceUser | null> {
    return this.repository.findOne({ where: { userId, spaceId: spaceId } });
  }

  public async findOneBySpaceIdAndUserEmail(spaceId: string, email: string): Promise<CnSpaceUser | null> {
    return this.repository.findOne({
      where: {
        spaceId: spaceId,
        user: { email: email },
      },
      relations: { user: true },
    });
  }

  public async findBySpace(spaceId: string, page: number, size: number): Promise<ClPage<CnSpaceUser>> {
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
  ): Promise<ClPage<CnSpaceUser>> {
    const searchBuilder = new BlSearchBuilder<CnSpaceUser>();
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
  ): Promise<ClPage<CnSpaceUser>> {
    if (ClHelpService.isNullOrEmpty(name)) {
      return this.findBySpace(spaceId, page, size);
    }

    const userSearch = new CnSpaceUserSearch(this, spaceId);
    return userSearch.smartSearchByName(name, page, size);
  }

  ///////////////////////////////// QUEUE /////////////////////////////////////////
  public async sendAllSpaceUsersToQueue(): Promise<void> {
    const spaceUsers = await this.repository.find({ relations: { user: true, space: true } });

    spaceUsers.forEach((spaceUser) => {
      this.sendSpaceUserToTransport(spaceUser);
    });
  }

  public async sendAllSpaceUsersFromASpaceToQueue(spaceId: string): Promise<void> {
    const spaceUsers = await this.repository.find({
      where: { spaceId: spaceId },
      relations: { user: true, space: true },
    });
    spaceUsers.forEach((spaceUser) => {
      this.sendSpaceUserToTransport(spaceUser);
    });
  }

  public sendSpaceUserToTransport(spaceUser: CnSpaceUser): void {
    const sU: Partial<CnSpaceUser> = {
      userId: spaceUser.userId,
      spaceId: spaceUser.spaceId,
      role: spaceUser.role,
      active: spaceUser.active,
      user: spaceUser.user,
      space: spaceUser.space,
      addedBy: spaceUser.addedBy,
      createdAt: spaceUser.createdAt,
    };
    this.queue.add(BlTransportSpaceUserPattern.CREATE, sU);
  }

  public sendActionOnSpaceUserToTransport(
    spaceUser: Partial<CnSpaceUser>,
    spaceUserAction: BlTransportSpaceUserPattern
  ): void {
    this.queue.add(spaceUserAction, spaceUser);
  }
}
