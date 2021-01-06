import {AbstractCheckAuthorization} from './abstract-check.authorization';
import {EntityWithId} from '../model/entities/entity-with-id.entity';

export type CombinedCheckOperator = 'AND' | 'OR';

/**
 * Class to allow combination of authorization
 * Support AND and OR operator for combination
 */
export class CombinedAuthorization extends AbstractCheckAuthorization {
  private readonly authorizations: AbstractCheckAuthorization[] = [];
  private readonly operator: CombinedCheckOperator;

  constructor(operator: CombinedCheckOperator, ...authorizations: AbstractCheckAuthorization[]) {
    super();
    this.authorizations = authorizations;
    this.operator = operator;
  }

  /**
   * Check the combined authorizations for an entity
   */
  isAuthorized(entity: EntityWithId): boolean {
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


  public addAuthorization(authorization: AbstractCheckAuthorization): void {
    this.authorizations.push(authorization);
  }

}
