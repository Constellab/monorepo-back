import { ClLuxonDateTransform } from '@monorepo/core-lib';
import { DateTime } from 'luxon';

import { CnLabVolumeType } from './cn-lab-volume-entity';

export class CnLabUpdateVolumeDTO {
  size: number;
  type: CnLabVolumeType;

  @ClLuxonDateTransform()
  startDate: DateTime;
}
