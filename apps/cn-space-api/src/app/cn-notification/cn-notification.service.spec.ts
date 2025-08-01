import { Test, TestingModule } from '@nestjs/testing';

import { CnNotificationService } from './cn-notification.service';

describe('CnNotificationService', () => {
  let service: CnNotificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CnNotificationService],
    }).compile();

    service = module.get<CnNotificationService>(CnNotificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
