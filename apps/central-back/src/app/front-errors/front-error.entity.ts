import {BeforeInsert, Column, Entity, ManyToOne} from 'typeorm';
import {Type} from 'class-transformer';
import {User} from '../users/user.entity';
import {DateTime} from 'luxon';
import {ClDateHelper} from '@monorepo/core-lib';
import {BlEntityWithId, BlLuxonDateTimeColumn} from '@monorepo/back-core-lib';
import {CurrentUserHelper} from '../core/utils/current-user.helper';

/**
 * Entity to store the front errors
 */
@Entity()
export class FrontError extends BlEntityWithId {

  @Column({nullable: false, length: 100})
  name: string;

  @Column({nullable: false, length: 1000})
  message: string;

  @Column({type: 'text', nullable: true})
  stackTrace: string;

  @Column({nullable: true, length: 200})
  route: string;

  @Type(() => User)
  @ManyToOne(() => User, {eager: true, nullable: true})
  createdBy: User;

  @BlLuxonDateTimeColumn({nullable: false, update: false})
  createdAt: DateTime;

  @BeforeInsert()
  setCreatedByUser(): void {
    this.createdBy = CurrentUserHelper.getCurrentUser();
    this.createdAt = ClDateHelper.getDate();
  }
}
