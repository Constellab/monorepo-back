import {AbstractCheckAuthorization} from './abstract-check.authorization';
import {RequestContextHelper} from '../modules/request-context/request-context.helper';
import {EntityWithOwner} from '../model/entities/entity-with-owner.entity';


/**
 * Authorization that check that the current user is the owner (calling getOwner()) user of the entity
 */
export class OwnerAuthorization extends AbstractCheckAuthorization<EntityWithOwner> {

  isAuthorized(entity: EntityWithOwner): boolean {
    return entity.getOwner().id === RequestContextHelper.getAndCheckCurrentUser().id;
  }

}
