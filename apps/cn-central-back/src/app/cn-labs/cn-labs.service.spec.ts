import {Test, TestingModule} from '@nestjs/testing';
import {CnLabsService} from './cn-labs.service';

describe('LabsService', () => {
  let service: CnLabsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CnLabsService],
    }).compile();

    service = module.get<CnLabsService>(CnLabsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
