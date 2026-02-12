import { BlExternalApiModule } from '@monorepo/back-core-lib';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { HnCoreConfigModule } from '../core/modules/core-config/hn-core-config.module';
import { HnUserModule } from '../users/hn-user.module';
import { HnRagflowChatbotController } from './hn-ragflow-chatbot.controller';
import { HnRagflowChatbotGateway } from './hn-ragflow-chatbot.gateway';
import { HnRagflowChatbotService } from './hn-ragflow-chatbot.service';

@Module({
  imports: [HnCoreConfigModule, BlExternalApiModule, HttpModule, HnUserModule],
  controllers: [HnRagflowChatbotController],
  providers: [HnRagflowChatbotService, HnRagflowChatbotGateway],
  exports: [HnRagflowChatbotService],
})
export class HnRagflowChatbotModule {}
