import { ClDateHelper, ClLuxonDateTransform } from '@monorepo/core-lib';
import { Type } from 'class-transformer';
import { DateTime } from 'luxon';
import { CnUser, CnUserEntity } from '../../cn-users/cn-user.entity';

export type CnLabKpiPeriod =
  | 'CURRENT_MONTH'
  | 'CURRENT_YEAR'
  | 'LAST_7_DAYS'
  | 'LAST_30_DAYS'
  | 'LAST_365_DAYS'
  | 'ALL'
  | 'CUSTOM';

/**
 * Object to request stats for a lab
 */
export class CnLabStatsRequestDTO {
  period: CnLabKpiPeriod;

  @ClLuxonDateTransform()
  customStartDate?: DateTime;

  @ClLuxonDateTransform()
  customEndDate?: DateTime;

  @Type(() => CnUserEntity)
  users?: CnUser[];

  constructor(period?: CnLabKpiPeriod) {
    this.period = period;
  }

  getStartDate(): DateTime {
    switch (this.period) {
      case 'CURRENT_MONTH':
        return ClDateHelper.getDate().startOf('month');
      case 'CURRENT_YEAR':
        return ClDateHelper.getDate().startOf('year');
      case 'LAST_7_DAYS':
        return ClDateHelper.getDate().minus({ days: 7 }).endOf('day');
      case 'LAST_30_DAYS':
        return ClDateHelper.getDate().minus({ days: 30 }).endOf('day');
      case 'LAST_365_DAYS':
        return ClDateHelper.getDate().minus({ days: 365 }).endOf('day');
      case 'ALL':
        return ClDateHelper.getDate('1900-01-01').startOf('day');
      case 'CUSTOM':
        return this.customStartDate
          ? this.customStartDate.startOf('day')
          : ClDateHelper.getDate('1900-01-01').startOf('day');
    }
  }

  getEndDate(): DateTime {
    const now = ClDateHelper.getDate();
    // if this is a custom period with an end date before now, we return the end date
    if (this.period === 'CUSTOM' && this.customEndDate != null && this.customEndDate < now) {
      return this.customEndDate.startOf('day');
    }
    return now;
  }

  hasUsersFilter(): boolean {
    return this.users != null && this.users.length > 0;
  }
}
