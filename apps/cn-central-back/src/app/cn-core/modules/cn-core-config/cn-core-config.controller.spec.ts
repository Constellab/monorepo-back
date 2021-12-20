import {Test, TestingModule} from '@nestjs/testing';
import {CnCoreConfigController} from './cn-core-config.controller';

describe('CoreConfigController', () => {
  let controller: CnCoreConfigController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CnCoreConfigController],
    }).compile();

    controller = module.get<CnCoreConfigController>(CnCoreConfigController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
