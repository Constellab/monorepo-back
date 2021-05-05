import {EntityWithId} from './entity-with-id.entity';
import {BeforeInsert, BeforeUpdate, ManyToOne} from 'typeorm';
import {User} from '../../../users/user.entity';
import {RequestContextHelper} from '../../modules/request-context/request-context.helper';
import {Type} from 'class-transformer';
import {ClDateHelper} from '@monorepo/core-lib';
import {DateTime} from 'luxon';
import {LuxonDateColumn} from '../../decorators/luxon-column.decorator';

export abstract class BaseEntity extends EntityWithId {

  @LuxonDateColumn({nullable: false, update: false})
  createdAt: DateTime;

  @Type(() => User)
  @ManyToOne(() => User, {eager: true, nullable: false})
  createdBy: User;

  @LuxonDateColumn()
  lastModifiedAt: DateTime;

  @Type(() => User)
  @ManyToOne(() => User, {eager: true})
  lastModifiedBy: User;

  @BeforeInsert()
  setCreatedByUser(): void {
    this.createdBy = RequestContextHelper.getAndCheckCurrentUser();
    this.createdAt = ClDateHelper.getDate();
  }

  @BeforeInsert()
  @BeforeUpdate()
  setLastModifiedByUser(): void {
    this.lastModifiedBy = RequestContextHelper.getAndCheckCurrentUser();
    this.lastModifiedAt = ClDateHelper.getDate();
  }

}
