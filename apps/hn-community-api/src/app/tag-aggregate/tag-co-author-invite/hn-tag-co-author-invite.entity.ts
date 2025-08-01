import { Expose } from 'class-transformer';
import { Column, Entity, ManyToOne } from 'typeorm';

import { HnInviteStatus } from '../../core/model/config/hn-invite-status.enum';
import { HnBaseEntity } from '../../core/model/entities/hn-base.entity';
import { HnTagKey } from '../tag-key/hn-tag-key.entity';

@Entity('tag_co_author_invite')
export class HnTagCoAuthorInvite extends HnBaseEntity {
  @Column()
  email: string;

  @Column('enum', { enum: HnInviteStatus, default: 'PENDING' })
  status: HnInviteStatus = HnInviteStatus.PENDING;

  @ManyToOne(() => HnTagKey, { eager: true })
  tagKey: HnTagKey;

  @Expose()
  @Column('uuid')
  token: string;
}
