import { Module } from '@nestjs/common';
import { CnChatMessageService } from './cn-chat-message.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CnChatMessageEntity } from './cn-chat-message.entity';
import { CnNotificationModule } from '../cn-notification/cn-notification.module';
import { CnDocumentModule } from '../cn-folders-aggregate/cn-documents/cn-document.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CnChatMessageEntity]),
    CnNotificationModule,
    CnDocumentModule
  ],
  providers: [CnChatMessageService],
  exports: [CnChatMessageService]
})
export class CnChatMessageModule {
}
