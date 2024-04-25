import {Column, Entity} from 'typeorm';
import {CnBaseEntity} from '../../cn-core/model/entities/cn-base.entity';
import {BlLuxonDateTimeColumn} from '@monorepo/back-core-lib';
import {DateTime} from 'luxon';
import {Expose} from 'class-transformer';

@Entity('storage_price')
export class CnStoragePrice extends CnBaseEntity {

  /**
   * Price of the volume per month per GB
   */
  @Column({nullable: false, type: 'float'})
  volumeStoragePrice: number;

  /**
   * Price of 1 backup per month per GB
   */
  @Column({nullable: false, type: 'float'})
  backupStoragePrice: number;

  /**
   * Price of the transfert per GB for the backup
   */
  @Column({nullable: false, type: 'float'})
  backupTransfertPrice: number;

  // interval dates for the price
  @BlLuxonDateTimeColumn({nullable: false})
  startDate: DateTime;

  @BlLuxonDateTimeColumn({nullable: true})
  endDate: DateTime;

  /**
   * Get the total price for the storage. this includes volume storage and 2 full backups.
   * For transfert, we consider that, each GB is transfert 1 time per month for each backup.
   */
  @Expose()
  get totalPrice(): number{
    return this.volumeStoragePrice + (this.backupStoragePrice * 2) + (this.backupTransfertPrice * 2);
  }

  /**
   * Explanation for the total price. Set here so it is not in the front bundle.
   */
  @Expose()
  get totalPriceDescription(): string{
    return 'This price includes volume storage and 2 full backups. For transfert, we consider that, each GB is transfert 1 time per month for each backup.';
  }
}
