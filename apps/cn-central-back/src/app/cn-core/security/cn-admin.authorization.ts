import {CnAbstractCheckAuthorization} from './cn-abstract-check.authorization';
import {CnCurrentUserHelper} from '../utils/cn-current-user.helper';

/**
 * Check authorization that the current user is an admin
 */
export class CnAdminAuthorization extends CnAbstractCheckAuthorization {

  isAuthorized(): boolean {
    return CnCurrentUserHelper.getCurrentUser()?.isAdmin() ?? false;
  }


  checkAuthorization(): void {
    return super.checkAuthorization(null);
  }
}
