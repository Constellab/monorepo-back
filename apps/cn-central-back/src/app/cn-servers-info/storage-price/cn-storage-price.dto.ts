import {DateTime} from 'luxon';
import {ClLuxonDateTransform} from '@monorepo/core-lib';

export class CnCreateStoragePriceDTO {
  price: number;

  @ClLuxonDateTransform()
  startDate: DateTime;
}
