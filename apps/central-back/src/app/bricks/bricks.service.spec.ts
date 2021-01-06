import { Test, TestingModule } from '@nestjs/testing';
import { BricksService } from './bricks.service';

describe('BricksService', () => {
  let service: BricksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BricksService],
    }).compile();

    service = module.get<BricksService>(BricksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
