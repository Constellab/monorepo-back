import {BlEntityWithId, BlLuxonDateTimeColumn} from '@monorepo/back-core-lib';
import {DateTime} from 'luxon';
import {Type} from 'class-transformer';
import {HnUser} from '../../users/hn-user.entity';
import {BeforeInsert, ManyToOne} from 'typeorm';
import {HnCurrentUserHelper} from '../../core/utils/hn-current-user.helper';
import {ClDateHelper} from '@monorepo/core-lib';

export abstract class HnAbstractLikeEntity extends BlEntityWithId{

  @BlLuxonDateTimeColumn({update: false})
  likedAt: DateTime;

  @Type(() => HnUser)
  @ManyToOne(() => HnUser, {eager: true})
  likedBy?: HnUser;

  @BeforeInsert()
  setLikedByUser(): void {
    this.likedBy = HnCurrentUserHelper.getCurrentUser();
    this.likedAt = ClDateHelper.getDate();
  }
}
