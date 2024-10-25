import { BeforeInsert, Column, Entity, ManyToOne } from 'typeorm';
import { Type } from 'class-transformer';
import { CnUser, CnUserEntity } from '../cn-users/cn-user.entity';
import { DateTime } from 'luxon';
import { ClDateHelper } from '@monorepo/core-lib';
import { BlEntityWithId, BlLuxonDateTimeColumn } from '@monorepo/back-core-lib';
import { CnCurrentUserHelper } from '../cn-core/utils/cn-current-user.helper';

/**
 * Entity to store the front errors
 */
@Entity('front_error')
export class CnFrontError extends BlEntityWithId {

  @Column({nullable: false, length: 100})
  name: string;

  @Column({nullable: false, length: 1000})
  message: string;

  @Column({type: 'text', nullable: true})
  stackTrace: string;

  @Column({nullable: true, length: 200})
  route: string;

  @Type(() => CnUserEntity)
  @ManyToOne(() => CnUserEntity, {eager: true, nullable: true})
  createdBy: CnUser;

  @BlLuxonDateTimeColumn({nullable: false, update: false})
  createdAt: DateTime;

  @BeforeInsert()
  setCreatedByUser(): void {
    this.createdBy = CnCurrentUserHelper.getCurrentUser();
    this.createdAt = ClDateHelper.getDate();
  }
}
