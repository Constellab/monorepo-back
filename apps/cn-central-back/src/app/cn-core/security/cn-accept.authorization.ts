import {CnAbstractCheckAuthorization} from './cn-abstract-check.authorization';


/**
 * Check authorization that always return true
 */
export class CnAcceptAuthorization extends CnAbstractCheckAuthorization {
  isAuthorized(): boolean {
    return true;
  }
}
