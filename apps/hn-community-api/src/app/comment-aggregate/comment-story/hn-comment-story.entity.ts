import { Type } from 'class-transformer';
import { Entity, ManyToOne } from 'typeorm';

import { HnStory } from '../../story/hn-story.entity';
import { HnCommentEntity } from '../comment-core/hn-comment.entity';

@Entity('comment_story')
export class HnCommentStory extends HnCommentEntity<HnStory> {
  @Type(() => HnStory)
  @ManyToOne(() => HnStory, { onDelete: 'CASCADE', nullable: false })
  entity: HnStory;
}
