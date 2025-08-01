import { Type } from 'class-transformer';
import { Entity, ManyToOne } from 'typeorm';

import { HnTagKey } from '../../tag-aggregate/tag-key/hn-tag-key.entity';
import { HnAbstractLikeEntity } from '../like-core/hn-abstract-like.entity';

@Entity('like_tag')
export class HnLikeTag extends HnAbstractLikeEntity<HnTagKey> {
  @Type(() => HnTagKey)
  @ManyToOne(() => HnTagKey, { eager: true, onDelete: 'CASCADE' })
  entity: HnTagKey;
}
