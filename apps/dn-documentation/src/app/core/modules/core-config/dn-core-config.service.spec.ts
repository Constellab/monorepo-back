import { Test, TestingModule } from '@nestjs/testing';
import { DnCoreConfigService } from './dn-core-config.service';

describe('CoreConfigService', () => {
  let service: DnCoreConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DnCoreConfigService],
    }).compile();

    service = module.get<DnCoreConfigService>(DnCoreConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
