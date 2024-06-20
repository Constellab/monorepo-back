import {BlEntityWithId} from '@monorepo/back-core-lib';
import {HnBaseDto} from '../../core/model/entities/hn-base.dto';
import {HnAbstractCommentEntity} from './hn-abstract-comment.entity';

export class HnAbstractCommentDto<T extends BlEntityWithId> extends HnBaseDto{
  content: Record<string, any>;
  entity: T;

  constructor(comment: HnAbstractCommentEntity<any>){
    super(comment);
    this.content = comment.content;
  }
}
