import { Test, TestingModule } from '@nestjs/testing';
import { HnBrickService } from './hn-brick.service';

describe('DnBrickService', () => {
  let service: HnBrickService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HnBrickService],
    }).compile();

    service = module.get<HnBrickService>(HnBrickService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
