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

  static setLabInstanceCurrentUser(user: HnUser): void {
    this.setAdditionalData('labInstanceUser', user);
  }

  static getAndCheckLabInstanceCurrentUser(): HnUser {
    const user = this.getCurrentAdditionalData()['labInstanceUser'] as HnUser;
    if (!user) {
      throw new Error('No lab instance user found');
    }
    return user;
  }
}
