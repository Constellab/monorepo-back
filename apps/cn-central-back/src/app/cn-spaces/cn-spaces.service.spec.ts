import {Test, TestingModule} from '@nestjs/testing';
import {CnSpaceService} from './cn-space.service';

describe('CnSpaceService', () => {
  let service: CnSpaceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CnSpaceService],
    }).compile();

    service = module.get<CnSpaceService>(CnSpaceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
