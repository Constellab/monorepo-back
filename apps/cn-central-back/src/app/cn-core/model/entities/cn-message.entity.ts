import { Column } from 'typeorm';
import { CnBaseEntity } from './cn-base.entity';
import { BlRichTextContent } from '@monorepo/back-core-lib';

export class CnMessage extends CnBaseEntity {

  @Column({ type: 'simple-json', nullable: true })
  content: BlRichTextContent;
}


export class CnNewMessageDTO {
  content: BlRichTextContent;
}
