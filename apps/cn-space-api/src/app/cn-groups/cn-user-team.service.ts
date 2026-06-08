import { BlAbstractPaginatedService, BlBadRequestException } from '@monorepo/back-core-lib';
import { ClPageI } from '@monorepo/core-lib';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';

import { CnErrorText } from '../cn-core/model/config/cn-error-text.class';
import { CnUserGroup } from './cn-group.entity';

/**
 * Service to manage user groups of teams
 */
@Injectable()
export class CnUserTeamService extends BlAbstractPaginatedService<CnUserGroup> {
  constructor(@InjectRepository(CnUserGroup) repository: Repository<CnUserGroup>) {
    super(repository, CnUserGroup);
  }

  public async addUserToTeam(groupId: string, userId: string): Promise<CnUserGroup> {
    if (await this.userIsInTeam(groupId, userId)) {
      throw new BlBadRequestException(CnErrorText.USER_ALREADY_IN_GROUP);
    }

    // add the user to the group
    const userGroup = new CnUserGroup();
    userGroup.groupId = groupId;
    userGroup.userId = userId;
    await this.repo.save(userGroup);

    return this.getByUserAndGroup(userId, groupId);
  }

  public async removeUserFromTeam(
    groupId: string,
    userId: string,
    entityManager?: EntityManager
  ): Promise<void> {
    if (!(await this.userIsInTeam(groupId, userId))) {
      throw new BlBadRequestException(CnErrorText.USER_NOT_IN_GROUP);
    }

    // check that there is at least 2 users in the group
    const count = await this.repo.count({ where: { groupId: groupId } });
    if (count === 1) {
      throw new BlBadRequestException(CnErrorText.REMOVE_GROUP_LAST_USER);
    }

    await this.getEntityManager(entityManager).delete(CnUserGroup, {
      groupId: groupId,
      userId: userId,
    });
  }

  public async userIsInTeam(groupId: string, userId: string): Promise<boolean> {
    const userGroup = await this.repo.findOne({
      where: {
        groupId: groupId,
        userId: userId,
      },
    });

    return userGroup != null;
  }

  public async userIsInAnyTeams(groupIds: string[], userId: string): Promise<boolean> {
    const userGroup = await this.repo.findOne({
      where: {
        groupId: In(groupIds),
        userId: userId,
      },
    });

    return userGroup != null;
  }

  public async getUsersOfTeam(groupId: string, page: number, size: number): Promise<ClPageI<CnUserGroup>> {
    return await this.findPaginated(page, size, {
      where: {
        groupId: groupId,
      },
      relations: ['user'],
    });
  }

  public async getAllUsersOfTeam(groupId: string): Promise<CnUserGroup[]> {
    return await this.repo.find({
      where: {
        groupId: groupId,
      },
      relations: ['user'],
    });
  }

  public async getByUserAndGroup(userId: string, groupId: string): Promise<CnUserGroup> {
    return this.repo.findOne({
      where: {
        groupId: groupId,
        userId: userId,
      },
      relations: { user: true },
    });
  }
}
