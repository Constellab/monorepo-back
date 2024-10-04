import { ClLuxonDateTimeTransform, ClLuxonDateTransform } from '@monorepo/core-lib';
import { DateTime } from 'luxon';
import { Type } from 'class-transformer';
import { CnUser } from '../../cn-users/cn-user.entity';

export interface CnLabInstanceStatusRunRequest {
  period: 'CURRENT_MONTH' | 'CURRENT_YEAR' | 'LAST_7_DAYS' | 'LAST_30_DAYS' | 'LAST_365_DAYS' | 'ALL' | 'CUSTOM';
  customStartDate?: string;
  customEndDate?: string;
}

/**
 * Only for hourly billed lab instances, it contains the price for the running period
 */
export class CnLabInstanceRunningStatusBilling {
  nbOfHours: number;
  pricePerHour: number;
  totalPrice: number;
}

export class CnLabInstanceStatusRunResponse {
  period: 'CURRENT_MONTH' | 'CURRENT_YEAR' | 'LAST_7_DAYS' | 'LAST_30_DAYS' | 'LAST_365_DAYS' | 'ALL' | 'CUSTOM';

  @ClLuxonDateTransform()
  fromDate: DateTime;
  @ClLuxonDateTransform()
  toDate: DateTime;

  runningDuration: number;

  @Type(() => CnLabInstanceRunningStatusBilling)
  billInfo?: CnLabInstanceRunningStatusBilling;

  @Type(() => CnLabInstanceRunningStatus)
  statuses: CnLabInstanceRunningStatus[];
}


export class CnLabInstanceRunningStatus {
  @ClLuxonDateTimeTransform()
  fromDate: DateTime;
  @ClLuxonDateTimeTransform()
  toDate: DateTime;

  duration: number;

  @Type(() => CnUser)
  user: CnUser

  @Type(() => CnLabInstanceRunningStatusBilling)
  billInfo?: CnLabInstanceRunningStatusBilling;

  setToDate(toDate: DateTime): void {
    this.toDate = toDate;
    this.duration = toDate.diff(this.fromDate, 'seconds').seconds;
    if(this.duration < 0) {
      this.duration = 0;
    }
  }
}
