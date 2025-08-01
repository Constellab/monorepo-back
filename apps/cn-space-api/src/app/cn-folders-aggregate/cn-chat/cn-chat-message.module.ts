import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CnNotificationModule } from '../../cn-notification/cn-notification.module';
import { CnDocumentModule } from '../cn-documents/cn-document.module';
import { CnChatMessageEntity } from './cn-chat-message.entity';
import { CnChatMessageService } from './cn-chat-message.service';

@Module({
  imports: [TypeOrmModule.forFeature([CnChatMessageEntity]), CnNotificationModule, CnDocumentModule],
  providers: [CnChatMessageService],
  exports: [CnChatMessageService],
})
export class CnChatMessageModule {}
