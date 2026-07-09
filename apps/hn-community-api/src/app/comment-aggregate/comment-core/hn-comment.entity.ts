import { BlEntityWithId } from '@monorepo/back-core-lib';
import { TeRichText, TeRichTextInput } from '@monorepo/te-text-editor';
import { Column } from 'typeorm';

import { HnBaseEntity } from '../../core/model/entities/hn-base.entity';

export class HnCommentEntity<T extends BlEntityWithId> extends HnBaseEntity {
  @Column({ type: 'simple-json' })
  content!: TeRichTextInput;

  entityId!: string;

  public getContentRichText(): TeRichText {
    return new TeRichText(this.content);
  }

  public setContentRichText(content: TeRichText): void {
    this.content = content.toJson();
  }

  entity!: T;
}
