import { Type } from 'class-transformer';
import { Entity, ManyToOne } from 'typeorm';

import { HnTagKey } from '../../tag-aggregate/tag-key/hn-tag-key.entity';
import { HnCommentEntity } from '../comment-core/hn-comment.entity';

@Entity('comment_tag')
export class HnCommentTag extends HnCommentEntity<HnTagKey> {
  @Type(() => HnTagKey)
  @ManyToOne(() => HnTagKey, { onDelete: 'CASCADE', nullable: false })
  entity: HnTagKey;
}
