import {AbstractCheckAuthorization} from './abstract-check.authorization';
import {EntityWithOwner} from '../model/entities/entity-with-owner.entity';
import {CurrentUserHelper} from '../utils/current-user.helper';


/**
 * Authorization that check that the current user is the owner (calling getOwner()) user of the entity
 */
export class OwnerAuthorization extends AbstractCheckAuthorization<EntityWithOwner> {

  isAuthorized(entity: EntityWithOwner): boolean {
    return entity.getOwner().id === CurrentUserHelper.getAndCheckCurrentUser().id;
  }

}
