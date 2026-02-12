import { BlPublic } from '@monorepo/back-core-lib';
import { Controller, Get } from '@nestjs/common';

import { HnCoreConfigService } from '../core/modules/core-config/hn-core-config.service';

@Controller('ragflow-chatbot')
export class HnRagflowChatbotController {
  constructor(private readonly coreConfigService: HnCoreConfigService) {}

  @BlPublic()
  @Get('status')
  getStatus(): { active: boolean } {
    const chatId = this.coreConfigService.getRagflowChatId();
    return { active: !!chatId };
  }
}
