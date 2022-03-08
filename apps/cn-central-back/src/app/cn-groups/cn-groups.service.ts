import {Injectable} from '@nestjs/common';
import {CnGroup} from './cn-group.entity';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {BlAbstractService} from '@monorepo/back-core-lib';
import {CnCurrentUserHelper} from '../cn-core/utils/cn-current-user.helper';
import {CnGroupType} from './cn-group-type.enum';
import {ClHelpService} from '@monorepo/core-lib';

@Injectable()
export class CnGroupsService extends BlAbstractService<CnGroup> {

  constructor(@InjectRepository(CnGroup) private repository: Repository<CnGroup>) {
    super(repository, CnGroup);
  }

  public async getCurrentUserGroups(): Promise<CnGroup[]> {
    const user = CnCurrentUserHelper.getAndCheckCurrentUser();
    return this.getUserGroups(user.id, user.organizationId);
  }

  public async getCurrentUserGroupIds(): Promise<string[]> {
    return (await this.getCurrentUserGroups()).map(group => group.id)
  }

  public async getUserGroups(userId: string, organisationId?: string): Promise<CnGroup[]> {
    const queryBuilder = this.repository.createQueryBuilder('group')
      .leftJoinAndSelect('group.users', 'user_group')
      .where('group.type = :typeUser and user_group.userId = :userId', {typeUser: CnGroupType.USERS, userId: userId})
      .orWhere('group.type = :typeSingle and group.userId = :userId', {
        typeSingle: CnGroupType.SINGLE_USER,
        userId: userId
      })
      .orWhere('group.type = :typeSingle and group.userId = :userId', {
        typeSingle: CnGroupType.SINGLE_USER,
        userId: userId
      });

    if (organisationId) {
      queryBuilder.orWhere('group.type = :typeOrga and group.organizationId = :organizationId', {
        typeOrga: CnGroupType.ORGANIZATION,
        organizationId: organisationId
      });
    }
    return queryBuilder.getMany();
  }

  public async currentUserIsInGroup(groupIds: string | string[]): Promise<boolean> {
    const groups = await this.getCurrentUserGroups();

    groupIds = ClHelpService.convertObjectOrArrayToArray(groupIds);

    return groups.findIndex(group => groupIds.includes(group.id)) >= 0;

  }

}
