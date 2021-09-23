import {BaseEntity} from './base.entity';
import {EntityWithId} from './entity-with-id.entity';
import {DateTime} from 'luxon';
import {BlLuxonDateTimeColumn} from '@monorepo/back-core-lib';

/**
 * Describe a status history table
 */
export abstract class StatusHistory<S> extends BaseEntity {

  @BlLuxonDateTimeColumn({nullable: true})
  endDate: DateTime;

  // status of this history
  status: S;

  // entity link that has the status
  entity: EntityWithId;
}
