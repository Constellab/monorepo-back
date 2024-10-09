import { ClLuxonDateTimeTransform, ClLuxonDateTransform } from '@monorepo/core-lib';
import { DateTime } from 'luxon';
import { Type } from 'class-transformer';
import { CnUser } from '../../cn-users/cn-user.entity';

/*
* Only for hourly billed labs, it contains the price for the running period
*/
export class CnLabStatsRunningBillingDTO {
  nbOfHours: number;
  pricePerHour: number;
  totalPrice: number;

  constructor(nbOfHours: number, pricePerHour: number) {
    this.nbOfHours = nbOfHours;
    this.pricePerHour = pricePerHour;
    this.totalPrice = nbOfHours * pricePerHour;
  }
}


export class CnLabStatsRunningStatusDTO {
  @ClLuxonDateTimeTransform()
  fromDate: DateTime;
  @ClLuxonDateTimeTransform()
  toDate: DateTime;

  duration: number;

  @Type(() => CnUser)
  user: CnUser;

  @Type(() => CnLabStatsRunningBillingDTO)
  billInfo?: CnLabStatsRunningBillingDTO;

  setToDate(toDate: DateTime): void {
    this.toDate = toDate;
    this.duration = toDate.diff(this.fromDate, 'seconds').seconds;
    if (this.duration < 0) {
      this.duration = 0;
    }
  }
}

export class CnLabStatsRunningResponseDTO {

  @ClLuxonDateTransform()
  fromDate: DateTime;
  @ClLuxonDateTransform()
  toDate: DateTime;

  runningDuration: number;

  billInfo?: CnLabStatsRunningBillingDTO;

  @Type(() => CnLabStatsRunningStatusDTO)
  statuses: CnLabStatsRunningStatusDTO[];
}

