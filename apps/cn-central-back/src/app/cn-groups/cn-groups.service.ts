import {BadRequestException, Injectable} from '@nestjs/common';
import {CnGroup, CnGroupSingleUser, CnGroupTeam, CnUserGroup} from './cn-group.entity';
import {InjectRepository} from '@nestjs/typeorm';
import {FindOneOptions, In, Repository} from 'typeorm';
import {BlAbstractService} from '@monorepo/back-core-lib';
import {CnCurrentUserHelper} from '../cn-core/utils/cn-current-user.helper';
import {CnGroupType} from './cn-group-type.enum';
import {ClHelpService, ClPageI} from '@monorepo/core-lib';
import {CnUser} from '../cn-users/cn-user.entity';
import {FindOptionsWhere} from 'typeorm/find-options/FindOptionsWhere';
import {FindOptionsRelations} from 'typeorm/find-options/FindOptionsRelations';

@Injectable()
export class CnGroupsService extends BlAbstractService<CnGroup> {

  constructor(@InjectRepository(CnGroup) private repository: Repository<CnGroup>) {
    super(repository, CnGroup);
  }

  ////////////////////////////////////// GROUP USERS ////////////////////////////////

  public async createTeam(label: string): Promise<CnGroupTeam> {
    let group = new CnGroupTeam();
    group.type = CnGroupType.TEAM;
    group.label = label;
    group.organization = CnCurrentUserHelper.getAndCheckCurrentOrganization();

    const entityManager = this.getEntityManager();
    group = await this.create(group, entityManager) as CnGroupTeam;


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

  ////////////////////////////////// GET /////////////////////////

  public async getCurrentUserAllGroups(): Promise<CnGroup[]> {
    const user = CnCurrentUserHelper.getAndCheckCurrentUser();
    const orga = CnCurrentUserHelper.getAndCheckCurrentOrganization();
    return this.getAllGroupsOfUser(user.id, orga.id);
  }

  public async getAllGroupIdsOfUser(userId: string, organizationId: string): Promise<string[]> {
    return (await this.getAllGroupsOfUser(userId, organizationId)).map(group => group.id);
  }


  /**
   * Get all groups of a user
   */
  public async getAllGroupsOfUser(userId: string, organizationId: string): Promise<CnGroup[]> {
    const groups = await this.getAllTeamsOfUser(userId, organizationId);
    const singleGroup = await this.getUserSingleGroup(userId);

    if (singleGroup) {
      return [...groups, singleGroup];
    } else {
      return groups;
    }
  }

  /**
   * Return the group if the user can view it
   * @param id
   */
  public async getAndCheckTeamById(id: string): Promise<CnGroupTeam> {
    const group = await this.findById(id);

    if (group.type !== CnGroupType.TEAM) {
      throw new BadRequestException('Can only work on teams');
    }
    return group as CnGroupTeam;
  }


  /**
   * return all the users as a list of group
   * @param groupIds
   */
  public async getUsersOfGroups(groupIds: string[]): Promise<CnUser[]> {
    const groups: CnGroup[] = await this.repo.find({
      where: {
        id: In(groupIds)
      },
      relations: {
        user: true,
        users: {
          user: true
        }
      } as FindOptionsRelations<CnGroupTeam | CnGroupSingleUser>
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
        const user = await group.user;
        users[user.id] = user;
      }
    }

    const currentUser = CnCurrentUserHelper.getCurrentUser();
    // set the current user in first pos, and sort the rest by fullname
    return Object.values(users).sort((a: CnUser, b: CnUser) => {
      if (a.id === currentUser.id) return -1;
      return ClHelpService.sortAlphabeticalFunction(a.fullname, b.fullname);
    });
  }

  ////////////////////////////////// TEAMS /////////////////////////

  public async getAllTeamsOfUser(userId: string, organizationId: string): Promise<CnGroup[]> {
    return this.repository.find(this.getTeamsOfUserOptions(userId, organizationId));
  }

  /**
   * Get groups of user paginated
   */
  public async getTeamsOfUser(userId: string, organizationId: string, page: number, size: number): Promise<ClPageI<CnGroup>> {
    return this.findPaginated(page, size, this.getTeamsOfUserOptions(userId, organizationId));
  };

  private getTeamsOfUserOptions(userId: string, organizationId: string): FindOneOptions<CnGroup> {
    const options: FindOneOptions<CnGroupTeam> = {
      where: {
        type: CnGroupType.TEAM,
        organizationId: organizationId,
        users: {
          userId: userId
        }
      },
      relations: {users: true}
    };
    return options as any;
  }

  ////////////////////////////////// SINGLE USER /////////////////////////


  public async getCurrentUserSingleGroup(): Promise<CnGroup> {
    return this.getUserSingleGroup(CnCurrentUserHelper.getAndCheckCurrentUser().id);
  }


  public async getUserSingleGroup(userId: string): Promise<CnGroupSingleUser> {
    const group = await this.repository.findOne({
      where: {
        userId: userId,
        type: CnGroupType.SINGLE_USER
      } as FindOptionsWhere<CnGroupSingleUser>
    });

    if (group == null) {
      throw new BadRequestException(`User ${userId} has no single group`);
    }
    return group as CnGroupSingleUser;
  }

}
