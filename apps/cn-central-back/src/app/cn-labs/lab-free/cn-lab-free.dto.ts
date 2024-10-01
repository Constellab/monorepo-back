import { CnLabFree } from './cn-lab-free.entity';
import { DateTime } from 'luxon';
import { ClLuxonDateTimeTransform } from '@monorepo/core-lib';
import { Type } from 'class-transformer';
import { CnUser } from '../../cn-users/cn-user.entity';
import { CnSpace } from '../../cn-spaces/cn-space.entity';

export type CnLabFreeStatus = 'NOT_USED' | 'IN_PROGRESS' | 'EXPIRED' | 'EXPIRED_AND_DELETED';

export class CnLabFreeGetDto {
  @Type(() => CnLabFree)
  freeLab: CnLabFree;

  currentUsageInSeconds: number;

  status: CnLabFreeStatus;

  @ClLuxonDateTimeTransform()
  deletionDate?: DateTime;

  // contains constants info
  standardInfo: {
    usageLimitInHours: number;
    nbCpus: number;
    ramSize: number;
    diskSize: number;
  };
}

export class CnLabFreeCreateDto {
  @Type(() => CnUser)
  user: CnUser;
  @Type(() => CnSpace)
  space: CnSpace;
}


export class CnLabFreeUpdateDto {
  usageLimitInHours: number;

  @ClLuxonDateTimeTransform()
  expirationDate?: DateTime;
}
