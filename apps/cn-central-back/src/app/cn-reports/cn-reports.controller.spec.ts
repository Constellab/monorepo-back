import {Test, TestingModule} from '@nestjs/testing';
import {CnReportsController} from './cn-reports.controller';

describe('ReportsController', () => {
  let controller: CnReportsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CnReportsController],
    }).compile();

    controller = module.get<CnReportsController>(CnReportsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
