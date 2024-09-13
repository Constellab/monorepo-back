import { Test, TestingModule } from '@nestjs/testing';
import { CnChatMessageService } from './cn-chat-message.service';

describe('CnProjectCommentService', () => {
  let service: CnChatMessageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CnChatMessageService],
    }).compile();

    service = module.get<CnChatMessageService>(CnChatMessageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
