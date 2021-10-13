import {BeforeInsert, BeforeUpdate, ManyToOne} from 'typeorm';
import {User} from '../../../users/user.entity';
import {Type} from 'class-transformer';
import {ClDateHelper} from '@monorepo/core-lib';
import {DateTime} from 'luxon';
import {BlEntityWithId, BlLuxonDateTimeColumn} from '@monorepo/back-core-lib';
import {CurrentUserHelper} from '../../utils/current-user.helper';

export abstract class BaseEntity extends BlEntityWithId {

  @BlLuxonDateTimeColumn({nullable: false, update: false})
  createdAt: DateTime;

  @Type(() => User)
  @ManyToOne(() => User, {eager: true, nullable: false})
  createdBy: User;

  @BlLuxonDateTimeColumn()
  lastModifiedAt: DateTime;

  @Type(() => User)
  @ManyToOne(() => User, {eager: true})
  lastModifiedBy: User;

  @BeforeInsert()
  setCreatedByUser(): void {
    this.createdBy = CurrentUserHelper.getAndCheckCurrentUser();
    this.createdAt = ClDateHelper.getDate();
  }

  @BeforeInsert()
  @BeforeUpdate()
  setLastModifiedByUser(): void {
    this.lastModifiedBy = CurrentUserHelper.getAndCheckCurrentUser();
    this.lastModifiedAt = ClDateHelper.getDate();
  }

}
