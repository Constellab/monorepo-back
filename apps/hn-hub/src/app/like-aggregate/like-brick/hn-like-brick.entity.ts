import {HnAbstractLikeEntity} from '../like-core/hn-abstract-like.entity';
import {Type} from 'class-transformer';
import {Entity, ManyToOne} from 'typeorm';
import {HnBrick} from '../../brick-aggregate/brick/hn-brick.entity';


@Entity('like_brick')
export class HnLikeBrick extends HnAbstractLikeEntity<HnBrick> {
  @Type(() => HnBrick)
  @ManyToOne(() => HnBrick, {eager: true})
  entity: HnBrick;
}
