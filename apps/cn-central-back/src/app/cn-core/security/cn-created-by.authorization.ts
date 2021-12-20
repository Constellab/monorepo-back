import {CnAbstractCheckAuthorization} from './cn-abstract-check.authorization';
import {CnBaseEntity} from '../model/entities/cn-base.entity';
import {CnCurrentUserHelper} from '../utils/cn-current-user.helper';

/**
 * Authorization that check that the current user if the created by user of the entity
 */
export class CnCreatedByAuthorization extends CnAbstractCheckAuthorization {

  isAuthorized(entity: CnBaseEntity): boolean {
    return entity.createdBy.id === CnCurrentUserHelper.getAndCheckCurrentUser().id;

  }

}
