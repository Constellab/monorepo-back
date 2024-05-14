import {Type} from 'class-transformer';
import {CnUser} from '../../../cn-users/cn-user.entity';
import {Column, ManyToOne} from 'typeorm';
import {CnBaseEntity} from './cn-base.entity';
import {BlRichTextContent} from '@monorepo/back-core-lib';

export class CnComment extends CnBaseEntity {

  @Column({type: 'simple-json', nullable: true})
  content: BlRichTextContent;

  @Type(() => CnComment)
  @ManyToOne(() => CnUser, {nullable: true})
  parentComment?: CnComment;

}


export class CnNewCommentDTO {
  content: BlRichTextContent;

  parentCommentId?: string;
}
