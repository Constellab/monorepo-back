import {BeforeInsert, BeforeUpdate, ManyToOne} from 'typeorm';
import {CnUser} from '../../../cn-users/cn-user.entity';
import {Type} from 'class-transformer';
import {ClDateHelper} from '@monorepo/core-lib';
import {DateTime} from 'luxon';
import {BlEntityWithId, BlLuxonDateTimeColumn} from '@monorepo/back-core-lib';
import {CnCurrentUserHelper} from '../../utils/cn-current-user.helper';

export abstract class CnBaseEntity extends BlEntityWithId {

  @BlLuxonDateTimeColumn({nullable: false, update: false})
  createdAt: DateTime;

  @Type(() => CnUser)
  @ManyToOne(() => CnUser, {eager: true, nullable: false})
  createdBy: CnUser;

  @BlLuxonDateTimeColumn()
  lastModifiedAt: DateTime;

  @Type(() => CnUser)
  @ManyToOne(() => CnUser, {eager: true})
  lastModifiedBy: CnUser;

  @BeforeInsert()
  setCreatedByUser(): void {
    this.createdBy = CnCurrentUserHelper.getAndCheckCurrentUser();
    this.createdAt = ClDateHelper.getDate();
  }

  @BeforeInsert()
  @BeforeUpdate()
  setLastModifiedByUser(): void {
    this.lastModifiedBy = CnCurrentUserHelper.getAndCheckCurrentUser();
    this.lastModifiedAt = ClDateHelper.getDate();
  }

}
