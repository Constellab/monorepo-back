import {EntityWithId} from '../model/entities/entity-with-id.entity';
import {UnauthorizedException} from '@nestjs/common';

/**
 * defined one authorization executed for an entity
 */
export abstract class AbstractCheckAuthorization {
  /**
   * Return true if the authorization is OK
   * @param entity entity to check
   */
  public abstract isAuthorized(entity: EntityWithId): boolean;

  /**
   * Check the authorization for the entity and throw a UnauthorizedException
   * if the authorization is false
   * @param entity entity to check
   */
  public checkAuthorization(entity: EntityWithId): void {
    if (!this.isAuthorized(entity)) {
      throw new UnauthorizedException();
    }
  }

}
