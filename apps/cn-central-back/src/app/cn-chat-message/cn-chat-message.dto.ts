import { BlBaseEntityDto } from '@monorepo/back-core-lib';
import { CnChatMessage } from './cn-chat-message.entity';
import { TeRichTextDTO } from '@monorepo/te-text-editor';

export class CnChatMessageDto extends BlBaseEntityDto {
  content: TeRichTextDTO;

  constructor(entity: CnChatMessage) {
    super(entity);
    this.content = entity.getRichTextContent().toJson();
  }
}
