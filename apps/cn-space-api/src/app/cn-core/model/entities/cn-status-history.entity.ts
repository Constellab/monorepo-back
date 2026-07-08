import { BlEntityWithId, BlLuxonDateTimeColumn } from '@monorepo/back-core-lib';
import { DateTime } from 'luxon';

import { CnBaseEntity } from './cn-base.entity';

/**
 * Describe a status history table
 */
export abstract class CnStatusHistory<S> extends CnBaseEntity {
  @BlLuxonDateTimeColumn({ nullable: true })
  endDate!: DateTime | null;

  // status of this history
  status!: S;

  // entity link that has the status
  entity!: BlEntityWithId;

  public getDurationInSeconds(): number {
    if (this.endDate) {
      return this.endDate.diff(this.createdAt, 'seconds').seconds;
    }
    return -1;
  }

  public startedBefore(date: DateTime): boolean {
    return this.createdAt < date;
  }

  public startedBetween(fromDate: DateTime, toDate: DateTime): boolean {
    return this.createdAt >= fromDate && this.createdAt < toDate;
  }

  /**
   * Return true if the status is still active at the given date
   * @param date
   */
  public endsAfter(date: DateTime): boolean {
    return this.endDate == null || this.endDate > date;
  }
}
