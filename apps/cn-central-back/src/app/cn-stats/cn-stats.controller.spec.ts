import { Test, TestingModule } from '@nestjs/testing';
import { CnStatsController } from './cn-stats.controller';
import { CnStatsService } from './cn-stats.service';

describe('CnStatsController', () => {
  let controller: CnStatsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CnStatsController],
      providers: [CnStatsService],
    }).compile();

    controller = module.get<CnStatsController>(CnStatsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
