import {Injectable, UnauthorizedException} from '@nestjs/common';
import {CnGroupsAggregateService} from '../../cn-groups/cn-groups-aggregate.service';
import {SnSmartDbEntity, SnSmartDbType} from '../model/sn-smart-db.entity';
import {CnUserOrgaInfo} from '../../cn-users/cn-user.dto';

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
  async checkAuthorizationToFindOne(smartDb: SnSmartDbEntity, userInfo: CnUserOrgaInfo): Promise<SnSmartDbEntity> {
    if (smartDb.type === SnSmartDbType.PUBLIC) {
      return smartDb;
    }

    // check the organization context
    if (smartDb.organizationId !== userInfo.organizationId) throw new UnauthorizedException();

    if (!userInfo.isOrganizationAdmin() && !await this.groupAggregateService.userIsInAnyGroup(userInfo.userId, smartDb.group.id)) {
      throw new UnauthorizedException();
    }

    return smartDb;
  }

  /**
   * Return the SnSmartDbEntity only if user is admin
   */
  async checkAuthorizationToUpdate(smartDb: SnSmartDbEntity, userInfo: CnUserOrgaInfo): Promise<SnSmartDbEntity> {
    // check the organization context
    if (smartDb.organizationId !== userInfo.organizationId) throw new UnauthorizedException();

    if (!userInfo.isAdmin()) throw new UnauthorizedException();

    return smartDb;
  }

  /**
   * Return the SnSmartDbEntity only if user is admin
   */
  async checkAuthorizationToCreate(userInfo: CnUserOrgaInfo): Promise<void> {
    if (!userInfo.isAdmin()) throw new UnauthorizedException();
  }
}
