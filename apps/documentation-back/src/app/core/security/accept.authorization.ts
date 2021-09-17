import {AbstractCheckAuthorization} from './abstract-check.authorization';


/**
 * Check authorization that always return true
 */
export class AcceptAuthorization extends AbstractCheckAuthorization {
  isAuthorized(): boolean {
    return true;
  }
}
