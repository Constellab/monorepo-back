import { BlEntityWithId } from '@monorepo/back-core-lib';
import { HnBaseDto } from '../../core/model/entities/hn-base.dto';
import { HnAbstractCommentEntity } from './hn-abstract-comment.entity';
import { TeRichTextDTO } from '@monorepo/te-text-editor';

export class HnAbstractCommentDto<T extends BlEntityWithId> extends HnBaseDto {
  content: TeRichTextDTO;
  entity: T;

  constructor(comment: HnAbstractCommentEntity<any>) {
    super(comment);
    this.content = comment.getContentRichText().toJson();
  }
}
