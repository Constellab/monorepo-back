import {BeforeInsert, BeforeUpdate, ManyToOne} from 'typeorm';
import {Type} from 'class-transformer';
import {ClDateHelper} from '@monorepo/core-lib';
import {DateTime} from 'luxon';
import {BlEntityWithId, BlLuxonDateTimeColumn} from '@monorepo/back-core-lib';
import {HnCurrentUserHelper} from '../../utils/hn-current-user.helper';
import {DnUser} from '../../../users/hn-user.entity';

export abstract class HnBaseEntity extends BlEntityWithId {

  @BlLuxonDateTimeColumn({nullable: true, update: false})
  createdAt: DateTime;

  @Type(() => DnUser)
  @ManyToOne(() => DnUser, {eager: true, nullable: true})
  createdBy?: DnUser;

  @BlLuxonDateTimeColumn({nullable: true})
  lastModifiedAt: DateTime;

  @Type(() => DnUser)
  @ManyToOne(() => DnUser, {eager: true, nullable: true})
  lastModifiedBy: DnUser;

  @BeforeInsert()
  setCreatedByUser(): void {
    this.createdBy = HnCurrentUserHelper.getCurrentUser();
    this.createdAt = ClDateHelper.getDate();
  }

  @BeforeInsert()
  @BeforeUpdate()
  setLastModifiedByUser(): void {
    this.lastModifiedBy = HnCurrentUserHelper.getCurrentUser();
    this.lastModifiedAt = ClDateHelper.getDate();
  }

}
