import {Type} from 'class-transformer';
import {CnUser} from '../../../cn-users/cn-user.entity';
import {Column, ManyToOne} from 'typeorm';
import {CnBaseEntity} from './cn-base.entity';
import {BlRichText, BlRichTextI} from '@monorepo/back-core-lib';

export class CnComment extends CnBaseEntity {

  @Column({type: 'simple-json', nullable: true})
  content: BlRichTextI;

  @Type(() => CnComment)
  @ManyToOne(() => CnUser, {nullable: true})
  parentComment?: CnComment;

  @Column({default: false})
  isResponse: boolean;

  init(newComment: CnNewComment): void {
    this.content = newComment ? BlRichText.getOptimisedContent(newComment.content) : null;
    if (newComment?.parentCommentId) {
      this.isResponse = true;
    }
  }
}


export class CnNewComment {
  content: BlRichTextI;

  parentCommentId?: string;
}
