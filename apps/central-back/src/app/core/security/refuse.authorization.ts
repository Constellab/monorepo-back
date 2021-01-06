import {AbstractCheckAuthorization} from './abstract-check.authorization';

/**
 * Check authorization that always return false
 */
export class RefuseAuthorization extends AbstractCheckAuthorization {
  isAuthorized(): boolean {
    return false;
  }
}
