import { Type } from 'class-transformer';
import { Entity, ManyToOne, Unique } from 'typeorm';

import { HnStory } from '../../story/hn-story.entity';
import { HnAbstractLikeEntity } from '../like-core/hn-abstract-like.entity';

@Unique(['entity', 'likedBy'])
@Entity('like_story')
export class HnLikeStory extends HnAbstractLikeEntity<HnStory> {
  @Type(() => HnStory)
  @ManyToOne(() => HnStory, { eager: true, onDelete: 'CASCADE' })
  entity: HnStory;
}
