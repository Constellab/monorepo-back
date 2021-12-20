import {Test, TestingModule} from '@nestjs/testing';
import {CnLabInstancesController} from './cn-lab-instances.controller';

describe('LabInstancesController', () => {
  let controller: CnLabInstancesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CnLabInstancesController],
    }).compile();

    controller = module.get<CnLabInstancesController>(CnLabInstancesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
