import {CnAbstractCheckAuthorization} from './cn-abstract-check.authorization';
import {CnEntityWithOwner} from '../model/entities/cn-entity-with-owner.entity';
import {CnCurrentUserHelper} from '../utils/cn-current-user.helper';


/**
 * Authorization that check that the current user is the owner (calling getOwner()) user of the entity
 */
export class CnOwnerAuthorization extends CnAbstractCheckAuthorization<CnEntityWithOwner> {

  isAuthorized(entity: CnEntityWithOwner): boolean {
    return entity.getOwner().id === CnCurrentUserHelper.getAndCheckCurrentUser().id;
  }

}
