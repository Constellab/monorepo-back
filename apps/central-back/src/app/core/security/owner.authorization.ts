import {AbstractCheckAuthorization} from './abstract-check.authorization';
import {BaseEntity} from '../model/entities/base.entity';
import {RequestContextHelper} from '../modules/request-context/request-context.helper';

/**
 * Authorization that check that the current user if the owner of the entity
 */
export class OwnerAuthorization extends AbstractCheckAuthorization {

  isAuthorized(entity: BaseEntity): boolean {
    return entity.createdBy.id === RequestContextHelper.getAndCheckCurrentUser().id;

  }

}
