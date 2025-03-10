import { HnCommentEntity } from '../comment-core/hn-comment.entity';
import { Type } from 'class-transformer';
import { Entity, ManyToOne } from 'typeorm';
import { HnStory } from '../../story/hn-story.entity';

@Entity('comment_story')
export class HnCommentStory extends HnCommentEntity<HnStory> {
  @Type(() => HnStory)
  @ManyToOne(() => HnStory, { onDelete: 'CASCADE' })
  entity: HnStory;
}
