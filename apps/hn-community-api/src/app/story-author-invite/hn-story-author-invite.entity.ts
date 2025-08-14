import { Entity, ManyToOne } from 'typeorm';

import { HnUserInvite } from '../core/model/entities/hn-user-invite.class';
import { HnStory } from '../story/hn-story.entity';

@Entity('story_co_author_invite')
export class HnStoryCoAuthorInvite extends HnUserInvite {
  @ManyToOne(() => HnStory, { eager: true })
  story: HnStory;
}
