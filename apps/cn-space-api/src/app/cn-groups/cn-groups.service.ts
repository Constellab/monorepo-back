import {
  BlAbstractService,
  BlBadRequestException,
  BlSearchBuilder,
  BlSearchParams,
} from '@monorepo/back-core-lib';
import { ClHelpService, ClPageI } from '@monorepo/core-lib';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, FindOneOptions, In, Like, Repository } from 'typeorm';
import { FindOptionsRelations } from 'typeorm/find-options/FindOptionsRelations';
import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere';

import { CnCurrentUserHelper } from '../cn-core/utils/cn-current-user.helper';
import { CnUser } from '../cn-users/cn-user.entity';
import { CnGroup, CnGroupSingleUser, CnGroupTeam, CnUserGroup } from './cn-group.entity';
import { CnGroupType } from './cn-group-type.enum';

@Injectable()
export class CnGroupsService extends BlAbstractService<CnGroup> {
  constructor(@InjectRepository(CnGroup) private repository: Repository<CnGroup>) {
    super(repository, CnGroup);
  }

  ////////////////////////////////////// GROUP USERS ////////////////////////////////

  public createOwnGroup(user: CnUser, entityManager: EntityManager): Promise<CnGroup> {
    const group: CnGroupSingleUser = new CnGroupSingleUser();
    group.label = user.alias;
    group.type = CnGroupType.SINGLE_USER;
    group.user = user;
    group.createdBy = user;
    group.lastModifiedBy = user;
    return entityManager.save(group);
  }

  ////////////////////////////////// GET /////////////////////////

  public async getCurrentUserAllGroups(): Promise<CnGroup[]> {
    const user = CnCurrentUserHelper.getAndCheckCurrentUser();
    const space = CnCurrentUserHelper.getAndCheckCurrentSpace();
    return this.getAllGroupsOfUser(user.id, space.id);
  }

  public async getAllGroupIdsOfUser(userId: string, spaceId: string): Promise<string[]> {
    return (await this.getAllGroupsOfUser(userId, spaceId)).map((group) => group.id);
  }

  /**
   * Get all groups of a user
   */
  public async getAllGroupsOfUser(userId: string, spaceId: string): Promise<CnGroup[]> {
    const groups = await this.getAllTeamsByUserAndSpace(userId, spaceId);
    const singleGroup = await this.getUserSingleGroup(userId);

    if (singleGroup) {
      return [...groups, singleGroup];
    } else {
      return groups;
    }
  }

  /**
   * return all the users as a list of groups
   * @param groupIds
   */
  public async getUsersOfGroups(groupIds: string[]): Promise<CnUser[]> {
    const groups: CnGroup[] = await this.repo.find({
      where: {
        id: In(groupIds),
      },
      relations: {
        user: true,
        users: {
          user: true,
        },
      } as FindOptionsRelations<CnGroupTeam | CnGroupSingleUser>,
    });

    // return all the user of all groupes without duplicate
    const users: Record<string, CnUser> = {};
    for (const group of groups) {
      if (group instanceof CnGroupTeam) {
        // add user to the map and avoid duplicate
        for (const user of group.users) {
          users[user.user.id] = user.user;
        }
      } else if (group instanceof CnGroupSingleUser) {
        const user = group.user;
        users[user.id] = user;
      }
    }

    const currentUser = CnCurrentUserHelper.getAndCheckCurrentUser();
    // set the current user in first pos, and sort the rest by alias
    return Object.values(users).sort((a: CnUser, b: CnUser) => {
      if (a.id === currentUser.id) return -1;
      return ClHelpService.sortAlphabeticalFunction(a.alias, b.alias);
    });
  }

  /**
   * Use to find all the group of a space.
   * Possibility to search by label.
   * It needs the complete list of user of the space to return the user groups
   */
  public async searchGroupsByLabelInSpace(
    spaceId: string,
    userIds: string[],
    label: string,
    page: number,
    size: number
  ): Promise<ClPageI<CnGroup>> {
    const teamWhere: FindOptionsWhere<CnGroupTeam> = {
      spaceId: spaceId,
    };

    let userWheres: FindOptionsWhere<CnGroupSingleUser>[] = [];
    if (!ClHelpService.isNullOrEmpty(label)) {
      teamWhere.label = Like(`%${label}%`);

      // search user by name in the list of provided user
      const userNameFilters = this.getSmartSearchNameFilters(label);
      userWheres = userNameFilters.map((filter) => {
        return {
          userId: In(userIds),
          user: filter,
        };
      });
    } else {
      userWheres = [{ userId: In(userIds) }];
    }

    return this.findPaginated(page, size, {
      where: [teamWhere, ...userWheres],
      order: {
        type: 'DESC', // have TEAM before SINGLE_USER
        label: 'ASC',
      },
    });
  }

  public async getAllGroupsInSpace(spaceId: string, userIds: string[]): Promise<CnGroup[]> {
    const teamWhere: FindOptionsWhere<CnGroupTeam> = {
      type: CnGroupType.TEAM,
      spaceId: spaceId,
    };

    const userWhere: FindOptionsWhere<CnGroupSingleUser> = {
      userId: In(userIds),
    };

    return this.repository.find({
      where: [teamWhere, userWhere],
      order: {
        type: 'DESC', // have TEAM before SINGLE_USER
        label: 'ASC',
      },
    });
  }

  private getSmartSearchNameFilters(name: string): FindOptionsWhere<CnUser>[] {
    const findByFirstNameOrLastName: FindOptionsWhere<CnUser>[] = [
      { lastname: Like(`%${name}%`) },
      { firstname: Like(`%${name}%`) },
    ];

    if (!name.includes(' ')) {
      return findByFirstNameOrLastName;
    }

    // if there are 2 words, search by lastname and firstname
    // if nothing is found, search by lastname or firstname
    const names = name.split(' ');
    if (names.length === 2) {
      return [
        {
          lastname: Like(`%${names[0]}%`),
          firstname: Like(`%${names[1]}%`),
        },
        {
          lastname: Like(`%${names[1]}%`),
          firstname: Like(`%${names[0]}%`),
        },
      ];
    }

    return findByFirstNameOrLastName;
  }

  ////////////////////////////////// TEAMS /////////////////////////

  public async createTeam(label: string): Promise<CnGroupTeam> {
    let group = new CnGroupTeam();
    group.type = CnGroupType.TEAM;
    group.label = label;
    group.space = CnCurrentUserHelper.getAndCheckCurrentSpace();

    const entityManager = this.getEntityManager();
    group = (await this.create(group, entityManager)) as CnGroupTeam;

    const userGroup = new CnUserGroup();
    userGroup.groupId = group.id;
    userGroup.userId = CnCurrentUserHelper.getAndCheckCurrentUser().id;
    await entityManager.save(userGroup);

    return group;
  }

  public async updateTeamLabel(team: CnGroupTeam, label: string): Promise<CnGroup> {
    team.label = label;
    return this.update(team);
  }

  /**
   * Return the group if the user can view it
   * @param id
   */
  public async getAndCheckTeamById(id: string): Promise<CnGroupTeam> {
    const group = await this.findById(id);

    if (group.type !== CnGroupType.TEAM) {
      throw new BlBadRequestException('Can only work on teams');
    }
    return group as CnGroupTeam;
  }

  public async getAllTeamsByUserAndSpace(userId: string, spaceId: string): Promise<CnGroup[]> {
    return this.repository.find(this.getTeamsByUserAndSpaceOptions(userId, spaceId));
  }

  /**
   * Get groups of user paginated
   */
  public async getTeamsByUserAndSpace(
    userId: string,
    spaceId: string,
    page: number,
    size: number
  ): Promise<ClPageI<CnGroup>> {
    return this.findPaginated(page, size, this.getTeamsByUserAndSpaceOptions(userId, spaceId));
  }

  private getTeamsByUserAndSpaceOptions(userId: string, spaceId: string): FindOneOptions<CnGroup> {
    const options: FindOneOptions<CnGroupTeam> = {
      where: {
        type: CnGroupType.TEAM,
        spaceId: spaceId,
        users: {
          userId: userId,
        },
      },
      relations: { users: true },
    };
    return options as any;
  }

  public async getTeamBySpace(spaceId: string, page: number, size: number): Promise<ClPageI<CnGroup>> {
    const options: FindOneOptions<CnGroupTeam> = {
      where: {
        type: CnGroupType.TEAM,
        spaceId: spaceId,
      },
    };
    return this.findPaginated(page, size, options as any);
  }

  public async searchTeamInSpace(
    spaceId: string,
    searchParam: BlSearchParams,
    page: number,
    size: number
  ): Promise<ClPageI<CnGroupTeam>> {
    const searchBuilder = new BlSearchBuilder<CnGroupTeam>({ label: 'ASC' });
    searchBuilder.addSearchParams(searchParam);
    searchBuilder.mergeWhereOptions({ spaceId: spaceId, type: CnGroupType.TEAM });

    return (await this.findPaginated(page, size, searchBuilder.build() as any)) as any;
  }

  ////////////////////////////////// SINGLE USER /////////////////////////

  public async getCurrentUserSingleGroup(): Promise<CnGroup> {
    return this.getUserSingleGroup(CnCurrentUserHelper.getAndCheckCurrentUser().id);
  }

  public async getUserSingleGroup(userId: string): Promise<CnGroupSingleUser> {
    const group = await this.repository.findOne({
      where: {
        userId: userId,
        type: CnGroupType.SINGLE_USER,
      } as FindOptionsWhere<CnGroupSingleUser>,
    });

    if (group == null) {
      throw new BlBadRequestException(`User ${userId} has no single group`);
    }
    return group as CnGroupSingleUser;
  }
}
