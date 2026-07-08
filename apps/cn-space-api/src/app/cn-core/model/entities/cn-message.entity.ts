import { TeRichText, TeRichTextInput, TeRichTextTransform } from '@monorepo/te-text-editor';
import { Column } from 'typeorm';

import { CnBaseEntity } from './cn-base.entity';

export class CnMessage extends CnBaseEntity {
  @Column({ type: 'simple-json', nullable: true })
  content!: TeRichTextInput | null;

  getRichTextContent(): TeRichText {
    return new TeRichText(this.content);
  }
}

export class CnNewMessageDTO {
  @TeRichTextTransform()
  content!: TeRichText;
}
