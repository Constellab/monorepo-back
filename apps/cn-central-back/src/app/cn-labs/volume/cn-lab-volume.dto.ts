import { CnLabVolumeType } from './cn-lab-volume-entity';
import { DateTime } from 'luxon';
import { ClLuxonDateTransform } from '@monorepo/core-lib';

export class CnLabUpdateVolumeDTO {
  size: number;
  type: CnLabVolumeType;

  @ClLuxonDateTransform()
  startDate: DateTime;
}
