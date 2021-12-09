import { Test, TestingModule } from '@nestjs/testing';
import { DnBrickVersionService } from './dn-brick-version.service';

describe('DnBrickVersionService', () => {
  let service: DnBrickVersionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DnBrickVersionService],
    }).compile();

    service = module.get<DnBrickVersionService>(DnBrickVersionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
