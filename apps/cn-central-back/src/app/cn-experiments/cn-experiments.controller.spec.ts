import {Test, TestingModule} from '@nestjs/testing';
import {CnExperimentsController} from './cn-experiments.controller';

describe('ExperimentsController', () => {
  let controller: CnExperimentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CnExperimentsController],
    }).compile();

    controller = module.get<CnExperimentsController>(CnExperimentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
