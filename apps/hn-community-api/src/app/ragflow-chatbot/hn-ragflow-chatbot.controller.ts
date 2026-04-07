import { BlBadRequestException, BlPublic } from '@monorepo/back-core-lib';
import { Body, Controller, Get, Post } from '@nestjs/common';

import { HnCoreConfigService } from '../core/modules/core-config/hn-core-config.service';
import { HnRagflowAskQuestionDto } from './hn-ragflow-chatbot.dto';
import { HnRagflowMessage, HnRagflowReference } from './hn-ragflow-chatbot.interface';
import { HnRagflowChatbotService } from './hn-ragflow-chatbot.service';

interface HnRagflowAskQuestionResponse {
  answer: string;
  sessionId: string;
  references: HnRagflowReference[];
}

@Controller('ragflow-chatbot')
export class HnRagflowChatbotController {
  constructor(
    private readonly coreConfigService: HnCoreConfigService,
    private readonly ragflowService: HnRagflowChatbotService
  ) {}

  @BlPublic()
  @Get('status')
  getStatus(): { active: boolean } {
    const chatId = this.coreConfigService.getRagflowChatId();
    return { active: !!chatId };
  }

  @BlPublic()
  @Post('ask')
  async askQuestion(@Body() dto: HnRagflowAskQuestionDto): Promise<HnRagflowAskQuestionResponse> {
    const chatId = this.coreConfigService.getRagflowChatId();
    if (!chatId) {
      throw new BlBadRequestException('Ragflow chatbot is not configured');
    }

    let sessionId = dto.sessionId;
    if (!sessionId) {
      sessionId = await this.ragflowService.createSession(chatId);
    }

    const message: HnRagflowMessage = await this.ragflowService.sendMessage(chatId, dto.message, sessionId);

    return {
      answer: message.content,
      sessionId,
      references: message.references || [],
    };
  }
}
