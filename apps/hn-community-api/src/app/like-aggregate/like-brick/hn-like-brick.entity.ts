import { Type } from 'class-transformer';
import { Entity, ManyToOne, Unique } from 'typeorm';

import { HnBrick, HnBrickEntity } from '../../brick-aggregate/brick/hn-brick.entity';
import { HnAbstractLikeEntity } from '../like-core/hn-abstract-like.entity';

@Unique(['entity', 'likedBy'])
@Entity('like_brick')
export class HnLikeBrick extends HnAbstractLikeEntity<HnBrick> {
  @Type(() => HnBrickEntity)
  @ManyToOne(() => HnBrickEntity, { eager: true, onDelete: 'CASCADE', nullable: false })
  entity: HnBrick;
}
