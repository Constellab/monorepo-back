import { Test, TestingModule } from '@nestjs/testing';
import { HnBrickMajorVersionService } from './hn-brick-major-version.service';

describe('DnBrickMajorVersionService', () => {
  let service: HnBrickMajorVersionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HnBrickMajorVersionService],
    }).compile();

    service = module.get<HnBrickMajorVersionService>(HnBrickMajorVersionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
