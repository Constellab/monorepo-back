import {Type} from 'class-transformer';
import {CnUser} from '../../../cn-users/cn-user.entity';
import {Column, ManyToOne} from 'typeorm';
import {CmRichTextI} from '@monorepo/common-model';
import {CnBaseEntity} from './cn-base.entity';

export class CnComment extends CnBaseEntity {

  @Column({type: 'simple-json', nullable: true})
  content: CmRichTextI;

  @Type(() => CnComment)
  @ManyToOne(() => CnUser, {nullable: true})
  parentComment?: CnComment;

  @Column({default: false})
  isResponse: boolean;

  constructor() {
    super();

  }

  init(newComment: CnNewComment): void {
    this.content = newComment?.content;
    if (newComment?.parentCommentId) {
      this.isResponse = true;
    }
  }
}


export class CnNewComment {
  content: CmRichTextI;

  parentCommentId?: string;
}
