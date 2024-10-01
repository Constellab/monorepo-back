import { ClLuxonDateTimeTransform, ClLuxonDateTransform } from '@monorepo/core-lib';
import { DateTime } from 'luxon';
import { Type } from 'class-transformer';
import { CnUser } from '../../cn-users/cn-user.entity';

export interface CnLabStatusRunRequest {
  period: 'CURRENT_MONTH' | 'CURRENT_YEAR' | 'LAST_7_DAYS' | 'LAST_30_DAYS' | 'LAST_365_DAYS' | 'ALL' | 'CUSTOM';
  customStartDate?: string;
  customEndDate?: string;
}

/**
 * Only for hourly billed labs, it contains the price for the running period
 */
export class CnLabRunningStatusBilling {
  nbOfHours: number;
  pricePerHour: number;
  totalPrice: number;
}

export class CnLabStatusRunResponse {
  period: 'CURRENT_MONTH' | 'CURRENT_YEAR' | 'LAST_7_DAYS' | 'LAST_30_DAYS' | 'LAST_365_DAYS' | 'ALL' | 'CUSTOM';

  @ClLuxonDateTransform()
  fromDate: DateTime;
  @ClLuxonDateTransform()
  toDate: DateTime;

  runningDuration: number;

  @Type(() => CnLabRunningStatusBilling)
  billInfo?: CnLabRunningStatusBilling;

  @Type(() => CnLabRunningStatus)
  statuses: CnLabRunningStatus[];
}


export class CnLabRunningStatus {
  @ClLuxonDateTimeTransform()
  fromDate: DateTime;
  @ClLuxonDateTimeTransform()
  toDate: DateTime;

  duration: number;

  @Type(() => CnUser)
  user: CnUser

  @Type(() => CnLabRunningStatusBilling)
  billInfo?: CnLabRunningStatusBilling;

  setToDate(toDate: DateTime): void {
    this.toDate = toDate;
    this.duration = toDate.diff(this.fromDate, 'seconds').seconds;
    if(this.duration < 0) {
      this.duration = 0;
    }
  }
}
