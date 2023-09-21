import {CnLabFreeTrial} from './cn-lab-free-trial.entity';
import {DateTime} from 'luxon';
import {ClLuxonDateTimeTransform} from '@monorepo/core-lib';
import {Type} from 'class-transformer';

export type CnLabFreeTrialStatus = 'NOT_USED' | 'IN_PROGRESS' | 'EXPIRED' | 'EXPIRED_AND_DELETED';

export class CnLabFreeTrialGetDto {
  @Type(() => CnLabFreeTrial)
  freeTrial: CnLabFreeTrial;

  currentUsageInSeconds: number;

  trialStatus: CnLabFreeTrialStatus;

  @ClLuxonDateTimeTransform()
  deletionDate?: DateTime;

  // contains constants info
  standardInfo: {
    usageLimitInHours: number;

    expirationDays: number;

    greenOptionInactivityDuration: number;
  };
}

export class CnFreeTrialUpdateDto {
  usageLimitInHours: number;

  @ClLuxonDateTimeTransform()
  expirationDate: DateTime;
}
