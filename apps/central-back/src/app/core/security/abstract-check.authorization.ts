import {UnauthorizedException} from '@nestjs/common';
import {BlEntityWithId} from '@monorepo/back-core-lib';

/**
 * defined one authorization executed for an entity
 */
export abstract class AbstractCheckAuthorization<T = BlEntityWithId> {
  /**
   * Return true if the authorization is OK
   * @param entity entity to check
   */
  public abstract isAuthorized(entity: T): boolean;

  /**
   * Check the authorization for the entity and throw a UnauthorizedException
   * if the authorization is false
   * @param entity entity to check
   */
  public checkAuthorization(entity: T): void {
    if (!this.isAuthorized(entity)) {
      throw new UnauthorizedException();
    }
  }

}
