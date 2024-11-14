import { Test, TestingModule } from '@nestjs/testing';
import { HnCoreConfigService } from './hn-core-config.service';

describe('HnCoreConfigService', () => {
  let service: HnCoreConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HnCoreConfigService],
    }).compile();

    service = module.get<HnCoreConfigService>(HnCoreConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
