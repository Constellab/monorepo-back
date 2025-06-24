import { Entity, ManyToOne } from 'typeorm';
import { HnAbstractLikeEntity } from '../like-core/hn-abstract-like.entity';
import { HnTagKey } from '../../tag-aggregate/tag-key/hn-tag-key.entity';
import { Type } from 'class-transformer';

@Entity('like_tag')
export class HnLikeTag extends HnAbstractLikeEntity<HnTagKey> {
  @Type(() => HnTagKey)
  @ManyToOne(() => HnTagKey, { eager: true, onDelete: 'CASCADE' })
  entity: HnTagKey;
}
