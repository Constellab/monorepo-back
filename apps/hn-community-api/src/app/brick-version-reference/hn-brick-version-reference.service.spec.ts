import { Test, TestingModule } from '@nestjs/testing';
import { HnBrickVersionReferenceService } from './hn-brick-version-reference.service';

describe('DnBrickMajorVersionService', () => {
  let service: HnBrickVersionReferenceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HnBrickVersionReferenceService],
    }).compile();

    service = module.get<HnBrickVersionReferenceService>(HnBrickVersionReferenceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
