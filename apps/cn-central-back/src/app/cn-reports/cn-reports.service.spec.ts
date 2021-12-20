import {Test, TestingModule} from '@nestjs/testing';
import {CnReportsService} from './cn-reports.service';

describe('ReportsService', () => {
  let service: CnReportsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CnReportsService],
    }).compile();

    service = module.get<CnReportsService>(CnReportsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
