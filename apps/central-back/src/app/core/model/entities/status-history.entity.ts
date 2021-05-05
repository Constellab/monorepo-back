import {BaseEntity} from './base.entity';
import {EntityWithId} from './entity-with-id.entity';
import {LuxonDateTimeColumn} from '../../decorators/luxon-column.decorator';
import {DateTime} from 'luxon';

/**
 * Describe a status history table
 */
export abstract class StatusHistory<S> extends BaseEntity {

  @LuxonDateTimeColumn({nullable: true})
  endDate: DateTime;

  // status of this history
  status: S;

  // entity link that has the status
  entity: EntityWithId;
}
