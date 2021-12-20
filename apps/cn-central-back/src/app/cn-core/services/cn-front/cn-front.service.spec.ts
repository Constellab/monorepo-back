import {Test, TestingModule} from '@nestjs/testing';
import {CnFrontService} from './cn-front.service';

describe('FrontService', () => {
  let service: CnFrontService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CnFrontService],
    }).compile();

    service = module.get<CnFrontService>(CnFrontService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
