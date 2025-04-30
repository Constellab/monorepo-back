import { DateTime } from 'luxon';
import { ClLuxonDateTransform } from '@monorepo/core-lib';

export class CnCreateStoragePriceDTO {
  volumeStoragePrice: number;

  backupStoragePrice: number;

  backupTransfertPrice: number;

  @ClLuxonDateTransform()
  startDate: DateTime;
}
