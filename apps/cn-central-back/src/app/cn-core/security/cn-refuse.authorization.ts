import {CnAbstractCheckAuthorization} from './cn-abstract-check.authorization';

/**
 * Check authorization that always return false
 */
export class CnRefuseAuthorization extends CnAbstractCheckAuthorization {
  isAuthorized(): boolean {
    return false;
  }
}
