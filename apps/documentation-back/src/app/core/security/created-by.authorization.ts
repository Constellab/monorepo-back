import {AbstractCheckAuthorization} from './abstract-check.authorization';
import {BaseEntity} from '../model/entities/base.entity';
import {RequestContextHelper} from '../modules/request-context/request-context.helper';

/**
 * Authorization that check that the current user if the created by user of the entity
 */
export class CreatedByAuthorization extends AbstractCheckAuthorization {

  isAuthorized(entity: BaseEntity): boolean {
    return entity.createdBy.id === RequestContextHelper.getAndCheckCurrentUser().id;

  }

}
