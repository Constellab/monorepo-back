import {AbstractCheckAuthorization} from './abstract-check.authorization';
import {RequestContextHelper} from '../modules/request-context/request-context.helper';

/**
 * Check authorization that the current user is an admin
 */
export class AdminAuthorization extends AbstractCheckAuthorization {

  isAuthorized(): boolean {
    return RequestContextHelper.getCurrentUser()?.isAdmin() ?? false;
  }


  checkAuthorization(): void{
   return super.checkAuthorization(null);
  }
}
