import { Test, TestingModule } from '@nestjs/testing';
import { DnVersionService } from './dn-version.service';

describe('VersionService', () => {
  let service: DnVersionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DnVersionService],
    }).compile();

    service = module.get<DnVersionService>(DnVersionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
