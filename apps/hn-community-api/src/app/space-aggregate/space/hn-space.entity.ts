import { BlEntityWithId, BlLuxonDateTimeColumn } from '@monorepo/back-core-lib';
import { ClDateHelper } from '@monorepo/core-lib';
import { Type } from 'class-transformer';
import { DateTime } from 'luxon';
import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne } from 'typeorm';

import { HnCurrentUserHelper } from '../../core/utils/hn-current-user.helper';
import { HnUser } from '../../users/hn-user.entity';

@Entity('space')
export class HnSpace extends BlEntityWithId {
  @Column({ nullable: false })
  name: string;

  @Column({ nullable: true })
  photo: string;

  @BlLuxonDateTimeColumn({ nullable: true, update: false })
  createdAt: DateTime;

  @Type(() => HnUser)
  @ManyToOne(() => HnUser, { eager: true, nullable: true })
  createdBy?: HnUser;

  @BlLuxonDateTimeColumn({ nullable: true })
  lastModifiedAt: DateTime;

  @Type(() => HnUser)
  @ManyToOne(() => HnUser, { eager: true, nullable: true })
  lastModifiedBy: HnUser;

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
