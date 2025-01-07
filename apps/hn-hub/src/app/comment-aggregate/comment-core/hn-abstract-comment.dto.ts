import { HnBaseDto } from '../../core/model/entities/hn-base.dto';
import { HnAbstractCommentEntity } from './hn-abstract-comment.entity';
import { TeRichTextDTO } from '@monorepo/te-text-editor';

export class HnAbstractCommentDto extends HnBaseDto {
  content: TeRichTextDTO;

  constructor(comment: HnAbstractCommentEntity<any>) {
    super(comment);
    this.content = comment.getContentRichText().toJson();
  }
}
