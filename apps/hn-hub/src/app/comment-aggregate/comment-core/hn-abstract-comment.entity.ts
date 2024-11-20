import { HnBaseEntity } from '../../core/model/entities/hn-base.entity';
import { Column } from 'typeorm';
import { BlEntityWithId } from '@monorepo/back-core-lib';
import { TeRichText, TeRichTextInput } from '@monorepo/te-text-editor';

export abstract class HnAbstractCommentEntity<T extends BlEntityWithId> extends HnBaseEntity {
  @Column({ name: 'content', type: 'simple-json' })
  content: TeRichTextInput;

  public getContentRichText(): TeRichText {
    return new TeRichText(this.content);
  }

  public setContentRichText(content: TeRichText): void {
    this.content = content.toJson();
  }

  abstract entity: T;
}
