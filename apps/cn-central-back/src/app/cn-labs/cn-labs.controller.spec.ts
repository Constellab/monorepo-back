import {Test, TestingModule} from '@nestjs/testing';
import {CnLabsController} from './cn-labs.controller';

describe('LabsController', () => {
  let controller: CnLabsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CnLabsController],
    }).compile();

    controller = module.get<CnLabsController>(CnLabsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
