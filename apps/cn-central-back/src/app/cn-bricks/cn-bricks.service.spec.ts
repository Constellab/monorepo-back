import { Test, TestingModule } from '@nestjs/testing';
import { CnBricksService } from './cn-bricks.service';

describe('BricksService', () => {
  let service: CnBricksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CnBricksService],
    }).compile();

    service = module.get<CnBricksService>(CnBricksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
