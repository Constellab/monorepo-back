import {CnUserGroup} from './cn-group.entity';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {ClPageI} from '@monorepo/core-lib';
import {CnUser} from '../cn-users/cn-user.entity';
import {BadRequestException, Injectable} from '@nestjs/common';
import {CnErrorText} from '../cn-core/model/config/cn-error-text.class';
import {BlAbstractPaginatedService} from '@monorepo/back-core-lib';

/**
 * Service to manage user groups of teams
 */
@Injectable()
export class CnUserGroupService extends BlAbstractPaginatedService<CnUserGroup> {

  constructor(@InjectRepository(CnUserGroup) repository: Repository<CnUserGroup>) {
    super(repository, CnUserGroup);
  }

  public async addUserToGroup(groupId: string, userId: string): Promise<CnUserGroup> {
    if (await this.userIsInGroup(groupId, userId)) {
      throw new BadRequestException(CnErrorText.USER_ALREADY_IN_GROUP);
    }

    // add the user to the group
    const userGroup = new CnUserGroup();
    userGroup.groupId = groupId;
    userGroup.userId = userId;
    return await this.repo.save(userGroup);
  }

  public async removeUserFromGroup(groupId: string, userId: string): Promise<void> {
    if (!(await this.userIsInGroup(groupId, userId))) {
      throw new BadRequestException(CnErrorText.USER_NOT_IN_GROUP);
    }

    // check that there is at least 2 users in the group
    const count = await this.repo.count({where: {groupId: groupId}});
    if(count === 1) {
      throw new BadRequestException(CnErrorText.REMOVE_GROUP_LAST_USER);
    }

    await this.repo.delete({
      groupId: groupId,
      userId: userId
    });
  }

  public async userIsInGroup(groupId: string, userId: string): Promise<boolean> {
    const userGroup = await this.repo.findOne({
      where: {
        groupId: groupId,
        userId: userId
      }
    });

    return userGroup != null;
  }


  public async getGetUsersOfGroup(groupId: string, page: number, size: number): Promise<ClPageI<CnUser>> {
    const result = await this.findPaginated(page, size, {
      where: {
        groupId: groupId
      },
      relations: ['user'],
    });

    return result.map((userGroup) => userGroup.user);
  }

}
