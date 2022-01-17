import { Test, TestingModule } from '@nestjs/testing';
import { HnBrickVersionService } from './hn-brick-version.service';

describe('DnBrickVersionService', () => {
  let service: HnBrickVersionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HnBrickVersionService],
    }).compile();

    service = module.get<HnBrickVersionService>(HnBrickVersionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
