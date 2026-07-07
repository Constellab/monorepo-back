import { BlUnauthorizedException } from '@monorepo/back-core-lib';
import { Injectable } from '@nestjs/common';

import { CnUser } from '../../cn-users/cn-user.entity';

/**
 * Basic security that allow only G admin to modify entities and all users to read entities
 */
@Injectable()
export class CnConfigEntitySecurity {
  public checkAuthorizationToModifyEntity(user: CnUser): Promise<void> {
    if (!user.isAdmin()) throw new BlUnauthorizedException();
    return Promise.resolve();
  }

  public checkAuthorizationToReadEntity(): Promise<void> {
    return Promise.resolve();
  }
}
