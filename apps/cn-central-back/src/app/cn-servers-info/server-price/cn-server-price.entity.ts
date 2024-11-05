import { Column, Entity, ManyToOne } from 'typeorm';
import { BlLuxonDateTimeColumn } from '@monorepo/back-core-lib';
import { DateTime } from 'luxon';
import { Type } from 'class-transformer';
import { CnServerStandard } from '../server-standard/cn-server-standard.entity';
import { CnBaseEntity } from '../../cn-core/model/entities/cn-base.entity';

@Entity('server_price')
export class CnServerPrice extends CnBaseEntity {
  @Column({ nullable: false, type: 'float' })
  price: number;

  // interval dates for the price
  @BlLuxonDateTimeColumn({ nullable: false })
  startDate: DateTime;

  @BlLuxonDateTimeColumn({ nullable: true })
  endDate: DateTime;

  @Type(() => CnServerStandard)
  @ManyToOne(() => CnServerStandard, { nullable: false })
  serverStandard: CnServerStandard;
}
