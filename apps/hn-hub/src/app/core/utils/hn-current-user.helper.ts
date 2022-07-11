import {BlCurrentUserHelper} from '@monorepo/back-core-lib';
import {HnUser} from '../../users/hn-user.entity';

export class HnCurrentUserHelper extends BlCurrentUserHelper {

  /**
   * returns the current authenticated user or null if not authenticated
   */
  static getCurrentUser(): HnUser | null {
    return super.getCurrentUser() as HnUser;
  }

  /**
   * returns the current authenticated user or throw a Unauthorized exception
   * if the user is not authenticated
   */
  static getAndCheckCurrentUser(): HnUser {

    return super.getAndCheckCurrentUser() as HnUser;
  }
}
