import { BlEntityWithId, BlLuxonDateTimeColumn } from '@monorepo/back-core-lib';
import { ClDateHelper } from '@monorepo/core-lib';
import { Type } from 'class-transformer';
import { DateTime } from 'luxon';
import { BeforeInsert, ManyToOne } from 'typeorm';

import { HnCurrentUserHelper } from '../../core/utils/hn-current-user.helper';
import { HnUser } from '../../users/hn-user.entity';

export abstract class HnAbstractLikeEntity<T extends BlEntityWithId> extends BlEntityWithId {
  @BlLuxonDateTimeColumn({ update: false })
  likedAt!: DateTime;

  @Type(() => HnUser)
  @ManyToOne(() => HnUser, { eager: true, nullable: false })
  likedBy!: HnUser;

  abstract entity: T;

  @BeforeInsert()
  setLikedByUser(): void {
    this.likedBy = HnCurrentUserHelper.getAndCheckCurrentUser();
    this.likedAt = ClDateHelper.getDate();
  }
}
