import { ClLuxonDateTransform } from '@monorepo/core-lib';
import { DateTime } from 'luxon';

export class CnCreateStoragePriceDTO {
  volumeStoragePrice!: number;

  backupStoragePrice!: number;

  backupTransfertPrice!: number;

  @ClLuxonDateTransform()
  startDate!: DateTime;
}
