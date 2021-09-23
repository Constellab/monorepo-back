import {AbstractCheckAuthorization} from './abstract-check.authorization';
import {CurrentUserHelper} from '../utils/current-user.helper';

/**
 * Check authorization that the current user is an admin
 */
export class AdminAuthorization extends AbstractCheckAuthorization {

  isAuthorized(): boolean {
    return CurrentUserHelper.getCurrentUser()?.isAdmin() ?? false;
  }


  checkAuthorization(): void {
    return super.checkAuthorization(null);
  }
}
