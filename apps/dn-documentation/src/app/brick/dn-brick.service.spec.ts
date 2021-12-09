import { Test, TestingModule } from '@nestjs/testing';
import { DnBrickService } from './dn-brick.service';

describe('DnBrickService', () => {
  let service: DnBrickService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DnBrickService],
    }).compile();

    service = module.get<DnBrickService>(DnBrickService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
