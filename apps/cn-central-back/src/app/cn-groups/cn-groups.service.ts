import {BadRequestException, Injectable, UnauthorizedException} from '@nestjs/common';
import {CnGroup, CnGroupUsers, CnUserGroup} from './cn-group.entity';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {BlAbstractService} from '@monorepo/back-core-lib';
import {CnCurrentUserHelper} from '../cn-core/utils/cn-current-user.helper';
import {CnGroupType} from './cn-group-type.enum';
import {ClHelpService} from '@monorepo/core-lib';
import {CnUsersService} from '../cn-users/cn-users.service';
import {CnUser} from '../cn-users/cn-user.entity';
import {CnErrorText} from '../cn-core/model/config/cn-error-text.class';

@Injectable()
export class CnGroupsService extends BlAbstractService<CnGroup> {

  constructor(@InjectRepository(CnGroup) private repository: Repository<CnGroup>,
              @InjectRepository(CnUserGroup) private userGroupRepo: Repository<CnUserGroup>,
              private usersService: CnUsersService) {
    super(repository, CnGroup);
  }

  ////////////////////////////////////// GROUP USERS ////////////////////////////////

  public async createGroupUsers(label: string): Promise<CnGroup> {
    let group = new CnGroupUsers();
    group.type = CnGroupType.USERS;
    group.label = label;

    const entityManager = this.getEntityManager();
    group = await this.create(group, entityManager) as CnGroupUsers;


    const userGroup = new CnUserGroup();
    userGroup.groupId = group.id;
    userGroup.userId = CnCurrentUserHelper.getAndCheckCurrentUser().id;
    // todo check this might not work because it is not the right repo
    await entityManager.save(userGroup);

    return group;
  }

  public async updateGroupLabel(id: string, label: string): Promise<CnGroup> {
    const group = await this.getAndCheckAuthorizationGroupUpdate(id);

    if (group.type === CnGroupType.USERS) {
      throw new BadRequestException('Can\'t update the label of the group');
    }

    group.label = label;
    return this.update(group);
  }


  public async addUserToGroup(userId: string, groupId: string): Promise<void> {
    const group: CnGroupUsers = await this.getAndCheckAuthorizationGroupUpdate(groupId) as CnGroupUsers;

    if (group.type !== CnGroupType.USERS) {
      throw new BadRequestException('You can only add user to normal groups');
    }

    if (group.userIsInGroup(userId)) {
      throw new BadRequestException(CnErrorText.USER_ALREADY_IN_GROUP);
    }

    const userGroup = new CnUserGroup();
    userGroup.groupId = groupId;
    userGroup.userId = userId;
    await this.userGroupRepo.save(userGroup);
  }

  public async removeUserFromGroup(userId: string, groupId: string): Promise<void> {
    const group: CnGroupUsers = await this.getAndCheckAuthorizationGroupUpdate(groupId) as CnGroupUsers;

    if (group.userIsInGroup(userId)) {
      throw new BadRequestException(CnErrorText.USER_NOT_IN_GROUP);
    }
    await this.userGroupRepo.delete({
      groupId: groupId,
      userId: userId
    });
  }

  /**
   * Get the group and check if the user can update it. He can only if he is an admin or is in group
   * @param groupId
   */
  public async getAndCheckAuthorizationGroupUpdate(groupId: string): Promise<CnGroup> {
    const currentUser = CnCurrentUserHelper.getAndCheckCurrentUser();

    const group: CnGroupUsers = await this.findByIdAndCheck(groupId, {
      relations: ['users']
    }) as CnGroupUsers;

    // can add only if user is admin or if user is in group
    if (!currentUser.isAdmin() && !group.userIsInGroup(currentUser.id)) {
      throw new UnauthorizedException();
    }

    return group;
  }

  ////////////////////////////////// GET /////////////////////////


  public async getCurrentUserGroups(): Promise<CnGroup[]> {
    const user = CnCurrentUserHelper.getAndCheckCurrentUser();
    return this.getGroupFromUser(user);
  }

  public async getCurrentUserGroupIds(): Promise<string[]> {
    return (await this.getCurrentUserGroups()).map(group => group.id);
  }

  public async getGroupsFromUserId(userId: string): Promise<CnGroup[]> {
    const user = await this.usersService.findByIdAndCheck(userId);
    return this.getGroupFromUser(user);
  }

  public async getGroupIdsFromUser(user: CnUser): Promise<string[]> {
    return (await this.getGroupFromUser(user)).map(group => group.id);
  }


  public async getGroupFromUser(user: CnUser): Promise<CnGroup[]> {
    const queryBuilder = this.repository.createQueryBuilder('group')
      .leftJoinAndSelect('group.users', 'user_group')
      .where('group.type = :typeUser and user_group.userId = :userId', {typeUser: CnGroupType.USERS, userId: user.id})
      .orWhere('group.type = :typeSingle and group.userId = :userId', {
        typeSingle: CnGroupType.SINGLE_USER,
        userId: user.id
      })
      .orWhere('group.type = :typeSingle and group.userId = :userId', {
        typeSingle: CnGroupType.SINGLE_USER,
        userId: user.id
      });

    if (user.hasOrganization()) {
      queryBuilder.orWhere('group.type = :typeOrga and group.organizationId = :organizationId', {
        typeOrga: CnGroupType.ORGANIZATION,
        organizationId: user.organizationId
      });
    }
    return queryBuilder.getMany();
  }

  public async currentUserIsInGroup(groupIds: string | string[]): Promise<boolean> {
    const groups = await this.getCurrentUserGroups();

    groupIds = ClHelpService.convertObjectOrArrayToArray(groupIds);

    return groups.findIndex(group => groupIds.includes(group.id)) >= 0;
  }

  public async getCurrentUserSingleGroup(): Promise<CnGroup> {
    return this.getUserSingleGroup(CnCurrentUserHelper.getAndCheckCurrentUser().id);
  }

  public async getUserSingleGroup(userId: string): Promise<CnGroup> {
    return this.repository.findOne({
      where: {
        user: {id: userId},
        type: CnGroupType.SINGLE_USER
      }
    });
  }

}
