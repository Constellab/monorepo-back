import {BeforeInsert, BeforeUpdate, ManyToOne} from 'typeorm';
import {Type} from 'class-transformer';
import {ClDateHelper} from '@monorepo/core-lib';
import {DateTime} from 'luxon';
import {BlEntityWithId, BlLuxonDateTimeColumn} from '@monorepo/back-core-lib';
import {DnCurrentUserHelper} from '../../utils/dn-current-user.helper';
import {DnUser} from '../../../users/dn-user.entity';

export abstract class DnBaseEntity extends BlEntityWithId {

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
    this.createdBy = DnCurrentUserHelper.getCurrentUser();
    this.createdAt = ClDateHelper.getDate();
  }

  @BeforeInsert()
  @BeforeUpdate()
  setLastModifiedByUser(): void {
    this.lastModifiedBy = DnCurrentUserHelper.getCurrentUser();
    this.lastModifiedAt = ClDateHelper.getDate();
  }

}
