import { Test, TestingModule } from '@nestjs/testing';
import { CnCoreConfigService } from './cn-core-config.service';

describe('CoreConfigService', () => {
  let service: CnCoreConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CnCoreConfigService],
    }).compile();

    service = module.get<CnCoreConfigService>(CnCoreConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
