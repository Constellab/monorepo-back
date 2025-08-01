import { Type } from 'class-transformer';
import { Entity, ManyToOne } from 'typeorm';

import { HnStory } from '../../story/hn-story.entity';
import { HnAbstractLikeEntity } from '../like-core/hn-abstract-like.entity';

@Entity('like_story')
export class HnLikeStory extends HnAbstractLikeEntity<HnStory> {
  @Type(() => HnStory)
  @ManyToOne(() => HnStory, { eager: true, onDelete: 'CASCADE' })
  entity: HnStory;
}
