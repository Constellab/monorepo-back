import {HnAbstractCommentEntity} from '../comment-core/hn-abstract-comment.entity';
import {Type} from 'class-transformer';
import {Entity, ManyToOne} from 'typeorm';
import {HnBrick} from '../../brick-aggregate/brick/hn-brick.entity';

@Entity('comment_brick')
export class HnCommentBrick extends HnAbstractCommentEntity {
  @Type(() => HnBrick)
  @ManyToOne(() => HnBrick, {eager: true})
  brick: HnBrick;
}
