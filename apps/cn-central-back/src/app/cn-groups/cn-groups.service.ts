import {Injectable} from '@nestjs/common';
import {CnGroup} from './cn-group.entity';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {BlAbstractService} from '@monorepo/back-core-lib';
import {CnCurrentUserHelper} from '../cn-core/utils/cn-current-user.helper';
import {CnGroupType} from './cn-group-type.enum';
import {ClHelpService} from '@monorepo/core-lib';
import {CnUsersService} from '../cn-users/cn-users.service';
import {CnUser} from '../cn-users/cn-user.entity';

@Injectable()
export class CnGroupsService extends BlAbstractService<CnGroup> {

  constructor(@InjectRepository(CnGroup) private repository: Repository<CnGroup>,
              private usersService: CnUsersService) {
    super(repository, CnGroup);
  }

  public async getCurrentUserGroups(): Promise<CnGroup[]> {
    const user = CnCurrentUserHelper.getAndCheckCurrentUser();
    return this.getGroupFromUser(user);
  }

  public async getCurrentUserGroupIds(): Promise<string[]> {
    return (await this.getCurrentUserGroups()).map(group => group.id);
  }

  public async getGroupsFromUserId(userId: string): Promise<CnGroup[]>{
    const user = await this.usersService.findByIdAndCheck(userId);
    return this.getGroupFromUser(user)
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
