import { Entity, ManyToOne } from 'typeorm';
import { HnCommentEntity } from '../comment-core/hn-comment.entity';
import { HnTagKey } from '../../tag-aggregate/tag-key/hn-tag-key.entity';
import { Type } from 'class-transformer';

@Entity('comment_tag')
export class HnCommentTag extends HnCommentEntity<HnTagKey> {
  @Type(() => HnTagKey)
  @ManyToOne(() => HnTagKey, { onDelete: 'CASCADE' })
  entity: HnTagKey;
}
