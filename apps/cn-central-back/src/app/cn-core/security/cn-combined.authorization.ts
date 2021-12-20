import {CnAbstractCheckAuthorization} from './cn-abstract-check.authorization';
import {BlEntityWithId} from '@monorepo/back-core-lib';

export type CombinedCheckOperator = 'AND' | 'OR';

/**
 * Class to allow combination of authorization
 * Support AND and OR operator for combination
 */
export class CnCombinedAuthorization extends CnAbstractCheckAuthorization<any> {
  private readonly authorizations: CnAbstractCheckAuthorization[] = [];
  private readonly operator: CombinedCheckOperator;

  constructor(operator: CombinedCheckOperator, ...authorizations: CnAbstractCheckAuthorization<any>[]) {
    super();
    this.authorizations = authorizations;
    this.operator = operator;
  }

  /**
   * Check the combined authorizations for an entity
   */
  isAuthorized(entity: BlEntityWithId): boolean {
    // if there is only one authorization
    if (this.authorizations.length === 1) {
      return this.authorizations[0].isAuthorized(entity);
    }

    // if there are multiple authorization
    // if the operator is AND
    if (this.operator === 'AND') {
      // check that all the authorization are OK
      for (const authorization of this.authorizations) {
        if (!authorization.isAuthorized(entity)) {
          return false;
        }
      }
      // if all the authorization are OK
      return true;
    } else {
      // if the operator is OR --> only one authorization is needed
      for (const authorization of this.authorizations) {
        if (authorization.isAuthorized(entity)) {
          return true;
        }
      }
      // if none passed
      return false;
    }
  }


  public addAuthorization(authorization: CnAbstractCheckAuthorization): void {
    this.authorizations.push(authorization);
  }

}
