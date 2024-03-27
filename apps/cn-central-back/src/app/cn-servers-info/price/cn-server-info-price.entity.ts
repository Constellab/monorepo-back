import {Column, Entity, ManyToOne} from 'typeorm';
import {BlEntityWithId, BlLuxonDateTimeColumn} from '@monorepo/back-core-lib';
import {DateTime} from 'luxon';
import {Type} from 'class-transformer';
import {CnServerInfo} from '../server-info/cn-server-info.entity';


@Entity('server_info_price')
export class CnServerInfoPrice extends BlEntityWithId {

  @Column({nullable: false, type: 'float'})
  price: number;

  // interval dates for the price
  @BlLuxonDateTimeColumn({nullable: false})
  startDate: DateTime;

  // if null, the price is still active
  @BlLuxonDateTimeColumn({nullable: true})
  endDate: DateTime;

  @Type(() => CnServerInfo)
  @ManyToOne(() => CnServerInfo, {nullable: false})
  serverInfo: CnServerInfo;

}
