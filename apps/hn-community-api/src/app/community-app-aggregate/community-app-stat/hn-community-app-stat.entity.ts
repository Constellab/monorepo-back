import { BlEntityWithId, BlLuxonDateTimeColumn } from '@monorepo/back-core-lib';
import { ClDateHelper } from '@monorepo/core-lib';
import { DateTime } from 'luxon';
import { BeforeInsert, Column, Entity, ManyToOne } from 'typeorm';

import { HnUser } from '../../users/hn-user.entity';

@Entity('app_stat')
export class HnCommunityAppStat extends BlEntityWithId {
  @Column({ name: 'app_url' })
  appUrl: string;

  @BlLuxonDateTimeColumn({ nullable: true, update: false })
  executionDate: DateTime;

  @ManyToOne(() => HnUser, { eager: true, onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  creator?: HnUser;

  @BeforeInsert()
  setCreatedByUser(): void {
    this.executionDate = ClDateHelper.getDate();
  }
}
