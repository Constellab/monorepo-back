import { Test, TestingModule } from '@nestjs/testing';
import { HnResourceService } from './hn-resource.service';

describe('HnResourceService', () => {
  let service: HnResourceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HnResourceService],
    }).compile();

    service = module.get<HnResourceService>(HnResourceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
