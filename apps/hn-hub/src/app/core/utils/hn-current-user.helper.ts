import {BlCurrentUserHelper, BlUser} from '@monorepo/back-core-lib';
import {DnUser} from '../../users/hn-user.entity';

export class HnCurrentUserHelper extends BlCurrentUserHelper {

  /**
   * returns the current authenticated user or null if not authenticated
   */
  static getCurrentUser(): DnUser | null {
    return super.getCurrentUser() as DnUser;
  }

  /**
   * returns the current authenticated user or throw a Unauthorized exception
   * if the user is not authenticated
   */
  static getAndCheckCurrentUser(): DnUser {

    return super.getAndCheckCurrentUser() as DnUser;
  }
}
