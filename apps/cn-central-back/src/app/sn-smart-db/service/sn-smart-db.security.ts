import {Injectable} from '@nestjs/common';
import {CnGroupsAggregateService} from '../../cn-groups/cn-groups-aggregate.service';
import {SnSmartDbEntity, SnSmartDbType} from '../model/sn-smart-db.entity';
import {CnUserSpaceInfo} from '../../cn-users/cn-user.dto';
import {BlUnauthorizedException} from '@monorepo/back-core-lib';

/**
 * Class to check the user authorization on smart db
 */
@Injectable()
export class SnSmartDbSecurity {

  constructor(private groupAggregateService: CnGroupsAggregateService) {
  }

  /**
   * Return the SnSmartDbEntity only if user is admin or one of his group has access to smart DB
   */
  async checkAuthorizationToFindOne(smartDb: SnSmartDbEntity, userInfo: CnUserSpaceInfo): Promise<SnSmartDbEntity> {
    if (smartDb.type === SnSmartDbType.PUBLIC) {
      return smartDb;
    }

    // check the space context
    if (smartDb.spaceId !== userInfo.spaceId) throw new BlUnauthorizedException();

    if (!userInfo.isSpaceAdmin() && !await this.groupAggregateService.userIsInAnyGroup(userInfo.userId, smartDb.group.id)) {
      throw new BlUnauthorizedException();
    }

    return smartDb;
  }

  /**
   * Return the SnSmartDbEntity only if user is admin
   */
  async checkAuthorizationToUpdate(smartDb: SnSmartDbEntity, userInfo: CnUserSpaceInfo): Promise<SnSmartDbEntity> {
    // check the space context
    if (smartDb.spaceId !== userInfo.spaceId) throw new BlUnauthorizedException();

    if (!userInfo.isAdmin()) throw new BlUnauthorizedException();

    return smartDb;
  }

  /**
   * Return the SnSmartDbEntity only if user is admin
   */
  async checkAuthorizationToCreate(userInfo: CnUserSpaceInfo): Promise<void> {
    if (!userInfo.isAdmin()) throw new BlUnauthorizedException();
  }
}
