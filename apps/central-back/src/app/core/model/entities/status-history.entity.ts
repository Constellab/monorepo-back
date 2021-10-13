import {BaseEntity} from './base.entity';
import {DateTime} from 'luxon';
import {BlEntityWithId, BlLuxonDateTimeColumn} from '@monorepo/back-core-lib';

/**
 * Describe a status history table
 */
export abstract class StatusHistory<S> extends BaseEntity {

  @BlLuxonDateTimeColumn({nullable: true})
  endDate: DateTime;

  // status of this history
  status: S;

  // entity link that has the status
  entity: BlEntityWithId;
}
