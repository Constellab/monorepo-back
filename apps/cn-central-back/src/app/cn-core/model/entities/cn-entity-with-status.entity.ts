import {CnBaseEntity} from './cn-base.entity';
import {CnStatusHistory} from './cn-status-history.entity';

/**
 * Describe an entity that has a current status linked to a status history
 */
export abstract class CnEntityWithStatus<S extends CnStatusHistory<any>> extends CnBaseEntity {

  currentStatus: S;
}
