import {HnAbstractCommentEntity} from '../comment-core/hn-abstract-comment.entity';
import {Type} from 'class-transformer';
import {Entity, ManyToOne} from 'typeorm';
import {HnStory} from '../../story/hn-story.entity';

@Entity('comment_story')
export class HnCommentStory extends HnAbstractCommentEntity<HnStory> {
  @Type(() => HnStory)
  @ManyToOne(() => HnStory, {eager: true})
  entity: HnStory;
}
