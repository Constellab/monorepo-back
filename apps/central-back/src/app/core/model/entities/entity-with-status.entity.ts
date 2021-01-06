import {BaseEntity} from './base.entity';
import {StatusHistory} from './status-history.entity';

/**
 * Describe an entity that has a current status linked to a status history
 */
export abstract class EntityWithStatus<S extends StatusHistory<any>> extends BaseEntity {

  currentStatus: S;
}
