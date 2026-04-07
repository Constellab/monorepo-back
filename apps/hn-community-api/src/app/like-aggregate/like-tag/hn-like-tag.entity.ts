import { Type } from 'class-transformer';
import { Entity, ManyToOne, Unique } from 'typeorm';

import { HnTagKey } from '../../tag-aggregate/tag-key/hn-tag-key.entity';
import { HnAbstractLikeEntity } from '../like-core/hn-abstract-like.entity';

@Unique(['entity', 'likedBy'])
@Entity('like_tag')
export class HnLikeTag extends HnAbstractLikeEntity<HnTagKey> {
  @Type(() => HnTagKey)
  @ManyToOne(() => HnTagKey, { eager: true, onDelete: 'CASCADE' })
  entity: HnTagKey;
}
