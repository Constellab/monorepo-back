import {BadRequestException, Injectable, UnauthorizedException} from '@nestjs/common';
import {CnGroup, CnGroupSingleUser, CnGroupTeam, CnUserGroup} from './cn-group.entity';
import {InjectRepository} from '@nestjs/typeorm';
import {DeleteResult, EntityManager, Repository} from 'typeorm';
import {BlAbstractService} from '@monorepo/back-core-lib';
import {CnCurrentUserHelper} from '../cn-core/utils/cn-current-user.helper';
import {CnGroupType} from './cn-group-type.enum';
import {ClHelpService, ClPage, ClPageI} from '@monorepo/core-lib';
import {CnUsersService} from '../cn-users/cn-users.service';
import {CnUser} from '../cn-users/cn-user.entity';
import {CnErrorText} from '../cn-core/model/config/cn-error-text.class';
import {SelectQueryBuilder} from 'typeorm/query-builder/SelectQueryBuilder';
import {CnUserGroupService} from './cn-user-group.service';
import {FindOptionsWhere} from 'typeorm/find-options/FindOptionsWhere';

@Injectable()
export class CnGroupsService extends BlAbstractService<CnGroup> {

  constructor(@InjectRepository(CnGroup) private repository: Repository<CnGroup>,
              private userGroupService: CnUserGroupService,
              private usersService: CnUsersService) {
    super(repository, CnGroup);
  }

  ////////////////////////////////////// GROUP USERS ////////////////////////////////

  public async createTeam(label: string): Promise<CnGroupTeam> {
    let group = new CnGroupTeam();
    group.type = CnGroupType.TEAM;
    group.label = label;

    const entityManager = this.getEntityManager();
    group = await this.create(group, entityManager) as CnGroupTeam;


    const userGroup = new CnUserGroup();
    userGroup.groupId = group.id;
    userGroup.userId = CnCurrentUserHelper.getAndCheckCurrentUser().id;
    await entityManager.save(userGroup);

    return group;
  }

  public async updateTeamLabel(id: string, label: string): Promise<CnGroup> {
    const group = await this.getAndCheckTeamById(id);

    group.label = label;
    return this.update(group);
  }


  /**
   * Add a user to a group. The current user need to be in the group and the added user need to be in the
   * same organization.
   * @param userId
   * @param groupId
   */
  public async addUserToTeam(userId: string, groupId: string): Promise<CnUser> {
    await this.checkAuthorizationToGetTeam(groupId);

    if (!CnCurrentUserHelper.getAndCheckCurrentUser().isAdmin()) {
      // check that the added user is in the same organization as the current user
      const user = await this.usersService.findByIdAndCheck(userId);
      if (!user.hasOrganization() || user.organizationId !== CnCurrentUserHelper.getCurrentUser().organizationId) {
        throw new UnauthorizedException(CnErrorText.USER_IN_OTHER_ORGANIZATION);
      }
    }

    await this.userGroupService.addUserToGroup(groupId, userId);
    return this.usersService.findByIdAndCheck(userId);
  }

  public async removeUserFromTeam(userId: string, groupId: string): Promise<void> {
    await this.checkAuthorizationToGetTeam(groupId);

    await this.userGroupService.removeUserFromGroup(groupId, userId);
  }

  public async deleteTeamById(id: string, entityManager?: EntityManager): Promise<DeleteResult> {
    await this.checkAuthorizationToGetTeam(id);

    return super.deleteById(id, entityManager);
  }

  ////////////////////////////////// GET /////////////////////////


  public async getCurrentUserAllGroups(): Promise<CnGroup[]> {
    const user = CnCurrentUserHelper.getAndCheckCurrentUser();
    return this.getAllGroupsOfUser(user);
  }

  public async getCurrentUserGroups(page: number, size: number): Promise<ClPageI<CnGroup>> {
    const user = CnCurrentUserHelper.getAndCheckCurrentUser();
    return await this.getGroupsOfUserPaginated(user, page, size);
  }

  public async getCurrentUserGroupIds(): Promise<string[]> {
    return (await this.getCurrentUserAllGroups()).map(group => group.id);
  }

  public async getGroupsFromUserId(userId: string): Promise<CnGroup[]> {
    const user = await this.usersService.findByIdAndCheck(userId);
    return this.getAllGroupsOfUser(user);
  }

  public async getGroupIdsFromUser(user: CnUser): Promise<string[]> {
    return (await this.getAllGroupsOfUser(user)).map(group => group.id);
  }

  /**
   * Get the group and check if the user can get or update it. He can only if he is an admin or is in group
   * @param groupId
   */
  private async checkAuthorizationToGetTeam(groupId: string): Promise<void> {
    const currentUser = CnCurrentUserHelper.getAndCheckCurrentUser();

    if (currentUser.isAdmin()) {
      return;
    }

    if (!(await this.userGroupService.userIsInGroup(groupId, currentUser.id))) {
      throw new UnauthorizedException();
    }
  }

  /**
   * Return the group if the user can view it
   * @param id
   */
  public async getAndCheckTeamById(id: string): Promise<CnGroupTeam> {
    await this.checkAuthorizationToGetTeam(id);

    const group = await this.findById(id);

    if (group.type !== CnGroupType.TEAM) {
      throw new BadRequestException('Can only work on teams');
    }
    return group as CnGroupTeam;
  }


  /**
   * Get all groups of a user
   * @param user
   */
  public async getAllGroupsOfUser(user: CnUser): Promise<CnGroup[]> {
    const queryBuilder = this.getGroupFromUserBuilder(user);
    return queryBuilder.getMany();
  }

  /**
   * Get groups of user paginated
   */
  private async getGroupsOfUserPaginated(user: CnUser, page: number, size: number): Promise<ClPageI<CnGroup>> {
    const queryBuilder = this.getGroupFromUserBuilder(user, false);

    // handle pagination
    if (page != null && size != null) {
      const safePage: number = this.getSafePage(page);
      const safeSize: number = this.getSafePageSize(size);
      queryBuilder.skip(safePage * safeSize).take(safeSize);
    }

    const [result, totalElements] = await queryBuilder.getManyAndCount();
    return ClPage.fromPagination(page, size, totalElements, result);
  }

  private getGroupFromUserBuilder(user: CnUser, includeSingleGroup: boolean = true): SelectQueryBuilder<CnGroup> {
    const queryBuilder = this.repository.createQueryBuilder('group')
      .leftJoinAndSelect('group.users', 'user_group')
      .leftJoinAndSelect('group.createdBy', 'created_by')
      .leftJoinAndSelect('group.lastModifiedBy', 'last_modified_by')
      .where('group.type = :typeUser and user_group.userId = :userId', {typeUser: CnGroupType.TEAM, userId: user.id});

    if (includeSingleGroup) {
      queryBuilder.orWhere('group.type = :typeSingle and group.userId = :userId', {
        typeSingle: CnGroupType.SINGLE_USER,
        userId: user.id
      });
    }

    if (user.hasOrganization()) {
      queryBuilder.orWhere('group.type = :typeOrga and group.organizationId = :organizationId', {
        typeOrga: CnGroupType.ORGANIZATION,
        organizationId: user.organizationId
      });
    }
    return queryBuilder;
  }

  /**
   * Check if a user is in a group (including all types of groups)
   * @param groupIds
   */
  public async currentUserIsInGroup(groupIds: string | string[]): Promise<boolean> {
    const groups = await this.getCurrentUserAllGroups();

    groupIds = ClHelpService.convertObjectOrArrayToArray(groupIds);

    return groups.findIndex(group => groupIds.includes(group.id)) >= 0;
  }

  public async getCurrentUserSingleGroup(): Promise<CnGroup> {
    return this.getUserSingleGroup(CnCurrentUserHelper.getAndCheckCurrentUser().id);
  }

  public async getUserSingleGroup(userId: string): Promise<CnGroup> {
    const group = await this.repository.findOne({
      where: {
        user: {id: userId},
        type: CnGroupType.SINGLE_USER
      } as FindOptionsWhere<CnGroupSingleUser>
    });

    if (group == null) {
      throw new BadRequestException(`User ${userId} has no single group`);
    }
    return group;
  }

  public async getUsersOfTeam(groupId: string, page: number, size: number): Promise<ClPageI<CnUser>> {
    await this.checkAuthorizationToGetTeam(groupId);

    return this.userGroupService.getGetUsersOfGroup(groupId, page, size);
  }


}
