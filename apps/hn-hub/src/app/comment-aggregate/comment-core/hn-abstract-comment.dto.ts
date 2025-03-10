import { HnBaseDto } from '../../core/model/entities/hn-base.dto';
import { HnCommentEntity } from './hn-comment.entity';
import { TeRichTextDTO } from '@monorepo/te-text-editor';

export class HnAbstractCommentDto extends HnBaseDto {
  content: TeRichTextDTO;

  constructor(comment: HnCommentEntity<any>) {
    super(comment);
    this.content = comment.getContentRichText().toJson();
  }
}
