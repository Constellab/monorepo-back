import { Column, Entity } from 'typeorm';
import { CnBaseEntity } from '../../cn-core/model/entities/cn-base.entity';
import { BlLuxonDateTimeColumn } from '@monorepo/back-core-lib';
import { DateTime } from 'luxon';
import { ClDateHelper } from '@monorepo/core-lib';

@Entity('storage_price')
export class CnStoragePrice extends CnBaseEntity {
  // number of hour in a month (30 days)
  private static HOURS_IN_MONTH = 30 * 24;

  /**
   * Price of the volume per month per GB
   */
  @Column({ nullable: false, type: 'float' })
  volumeStoragePrice: number;

  /**
   * Price of 1 backup per month per GB
   */
  @Column({ nullable: false, type: 'float' })
  backupStoragePrice: number;

  /**
   * Price of the transfert per GB for the backup
   */
  @Column({ nullable: false, type: 'float' })
  backupTransfertPrice: number;

  // interval dates for the price
  @BlLuxonDateTimeColumn({ nullable: false })
  startDate: DateTime;

  @BlLuxonDateTimeColumn({ nullable: true })
  endDate?: DateTime;

  get volumePricePerHour(): number {
    return this.volumeStoragePrice / CnStoragePrice.HOURS_IN_MONTH;
  }

  get backupPricePerHour(): number {
    return this.backupStoragePrice / CnStoragePrice.HOURS_IN_MONTH;
  }

  getEndDateWithDefault(): DateTime {
    return this.endDate ?? ClDateHelper.getDate('9999-12-31');
  }

  dateIsBetween(date: DateTime): boolean {
    return this.startDate <= date && this.getEndDateWithDefault() > date;
  }
}
