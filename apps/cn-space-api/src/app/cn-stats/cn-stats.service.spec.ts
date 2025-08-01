import { Test, TestingModule } from '@nestjs/testing';

import { CnStatsService } from './cn-stats.service';

describe('CnStatsService', () => {
  let service: CnStatsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CnStatsService],
    }).compile();

    service = module.get<CnStatsService>(CnStatsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
