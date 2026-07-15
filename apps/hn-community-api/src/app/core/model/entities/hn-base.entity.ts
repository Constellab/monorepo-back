import { BlEntityWithId, BlLuxonDateTimeColumn } from '@monorepo/back-core-lib';
import { ClDateHelper } from '@monorepo/core-lib';
import { Type } from 'class-transformer';
import { DateTime } from 'luxon';
import { BeforeInsert, BeforeUpdate, ManyToOne } from 'typeorm';

import { HnUser } from '../../../users/hn-user.entity';
import { HnCurrentUserHelper } from '../../utils/hn-current-user.helper';

export abstract class HnBaseEntity extends BlEntityWithId {
  @BlLuxonDateTimeColumn({ nullable: true, update: false })
  createdAt!: DateTime;

  @Type(() => HnUser)
  @ManyToOne(() => HnUser, { eager: true, nullable: true })
  createdBy!: HnUser | null;

  @BlLuxonDateTimeColumn({ nullable: true })
  lastModifiedAt!: DateTime;

  @Type(() => HnUser)
  @ManyToOne(() => HnUser, { eager: true, nullable: true })
  lastModifiedBy!: HnUser | null;

  @BeforeInsert()
  setCreatedByUser(): void {
    this.createdBy = HnCurrentUserHelper.getCurrentUser() ?? null;
    this.createdAt = ClDateHelper.getDate();
  }

  @BeforeInsert()
  @BeforeUpdate()
  setLastModifiedByUser(): void {
    this.lastModifiedBy = HnCurrentUserHelper.getCurrentUser() ?? null;
    this.lastModifiedAt = ClDateHelper.getDate();
  }
}
