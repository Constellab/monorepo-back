import { Expose } from 'class-transformer';
import { Column, Entity, ManyToOne } from 'typeorm';

import { HnInviteStatus } from '../core/model/config/hn-invite-status.enum';
import { HnBaseEntity } from '../core/model/entities/hn-base.entity';
import { HnStory } from '../story/hn-story.entity';

@Entity('story_co_author_invite')
export class HnStoryCoAuthorInvite extends HnBaseEntity {
  @Column()
  email: string;

  @Column('enum', { enum: HnInviteStatus, default: HnInviteStatus.PENDING })
  status: HnInviteStatus = HnInviteStatus.PENDING;

  @ManyToOne((type) => HnStory, { eager: true })
  story: HnStory;

  @Expose()
  @Column('uuid')
  token: string;
}
