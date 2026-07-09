import { BlLuxonDateTimeColumn } from '@monorepo/back-core-lib';
import { Expose } from 'class-transformer';
import { DateTime } from 'luxon';
import { Column } from 'typeorm';

import { HnUserDto } from '../../../users/hn-user.dto';
import { HnInviteStatus } from '../config/hn-invite-status.enum';
import { HnBaseEntity } from './hn-base.entity';

export abstract class HnUserInvite extends HnBaseEntity {
  static readonly INVITE_EXPIRY_DAYS = 7;

  @Column()
  email!: string;

  @Column('enum', { enum: HnInviteStatus, default: HnInviteStatus.PENDING })
  status: HnInviteStatus = HnInviteStatus.PENDING;

  @Expose()
  @Column('uuid')
  token!: string;

  @BlLuxonDateTimeColumn({ nullable: true })
  expiresAt!: DateTime;

  user?: HnUserDto;

  isExpired(): boolean {
    return this.expiresAt != null && this.expiresAt < DateTime.now();
  }
}
