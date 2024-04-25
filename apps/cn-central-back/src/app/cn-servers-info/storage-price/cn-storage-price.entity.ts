import {Column, Entity} from 'typeorm';
import {CnBaseEntity} from '../../cn-core/model/entities/cn-base.entity';
import {BlLuxonDateTimeColumn} from '@monorepo/back-core-lib';
import {DateTime} from 'luxon';

@Entity('storage_price')
export class CnStoragePrice extends CnBaseEntity {

  @Column({nullable: false, type: 'float'})
  price: number;

  // interval dates for the price
  @BlLuxonDateTimeColumn({nullable: false})
  startDate: DateTime;

  @BlLuxonDateTimeColumn({nullable: true})
  endDate: DateTime;

}
