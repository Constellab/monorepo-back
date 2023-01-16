import { Test, TestingModule } from '@nestjs/testing';
import { HnLabelService } from './hn-label.service';

describe('HnStoryLabelService', () => {
  let service: HnLabelService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HnLabelService],
    }).compile();

    service = module.get<HnLabelService>(HnLabelService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
