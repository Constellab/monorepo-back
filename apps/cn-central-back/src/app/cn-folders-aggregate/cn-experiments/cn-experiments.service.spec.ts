import {Test, TestingModule} from '@nestjs/testing';
import {CnExperimentsService} from './cn-experiments.service';

describe('ExperimentsService', () => {
  let service: CnExperimentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CnExperimentsService],
    }).compile();

    service = module.get<CnExperimentsService>(CnExperimentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
