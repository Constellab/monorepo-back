import {ClLuxonDateTimeTransform, ClLuxonDateTransform} from '@monorepo/core-lib';
import {DateTime} from 'luxon';
import {Type} from 'class-transformer';

export interface CnLabInstanceStatusRunRequest {
  period: 'LAST_WEEK' | 'LAST_MONTH' | 'LAST_YEAR' | 'ALL' | 'CUSTOM';
  customStartDate?: string;
  customEndDate?: string;
}

export class CnLabInstanceStatusRunResponse {
  period: 'LAST_WEEK' | 'LAST_MONTH' | 'LAST_YEAR' | 'ALL' | 'CUSTOM';

  @ClLuxonDateTransform()
  fromDate: DateTime;
  @ClLuxonDateTransform()
  toDate: DateTime;

  runningDuration: number;

  @Type(() => CnLabInstanceRunningStatus)
  statuses: CnLabInstanceRunningStatus[];
}

export class CnLabInstanceRunningStatus {
  @ClLuxonDateTimeTransform()
  fromDate: DateTime;
  @ClLuxonDateTimeTransform()
  toDate: DateTime;

  duration: number;

  setToDate(toDate: DateTime): void {
    this.toDate = toDate;
    this.duration = toDate.diff(this.fromDate, 'seconds').seconds;
  }
}
