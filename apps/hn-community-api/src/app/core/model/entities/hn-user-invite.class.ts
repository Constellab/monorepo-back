import { Expose } from 'class-transformer';
import { Column } from 'typeorm';

import { HnUserDto } from '../../../users/hn-user.dto';
import { HnInviteStatus } from '../config/hn-invite-status.enum';
import { HnBaseEntity } from './hn-base.entity';

export abstract class HnUserInvite extends HnBaseEntity {
  @Column()
  email: string;

  @Column('enum', { enum: HnInviteStatus, default: HnInviteStatus.PENDING })
  status: HnInviteStatus = HnInviteStatus.PENDING;

  @Expose()
  @Column('uuid')
  token: string;

  user?: HnUserDto;
}
