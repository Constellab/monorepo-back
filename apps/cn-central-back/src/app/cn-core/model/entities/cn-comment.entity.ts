import {Type} from 'class-transformer';
import {CnUser} from '../../../cn-users/cn-user.entity';
import {Column, ManyToOne} from 'typeorm';
import {CmRichText, CmRichTextI} from '@monorepo/common-model';
import {CnBaseEntity} from './cn-base.entity';
import {CnProject} from '../../../cn-projects-aggregate/cn-projects/cn-project.entity';

export class CnComment extends CnBaseEntity {

  @Column({type: 'simple-json', nullable: true, collation: 'utf8mb4_unicode_ci' })
  content: CmRichTextI;

  @Type(() => CnComment)
  @ManyToOne(() => CnUser, {nullable: true})
  parentComment?: CnComment;

  @Column({default: false})
  isResponse: boolean;

  @Type(() => CnProject)
  @ManyToOne(() => CnProject, {eager: true, nullable: false})
  project: CnProject;

  constructor() {
    super();

  }

  init(newComment: CnNewComment): void {
    this.content = newComment? CmRichText.getOptimisedContent(newComment.content) : null;
    if (newComment?.parentCommentId) {
      this.isResponse = true;
    }
  }
}


export class CnCommentImage {
  filename: string;
  width: number;
  height: number;
}

export class CnNewComment {
  content: CmRichTextI;

  parentCommentId?: string;
}
