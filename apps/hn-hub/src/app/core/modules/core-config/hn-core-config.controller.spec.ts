import {Test, TestingModule} from '@nestjs/testing';
import {HnCoreConfigController} from './hn-core-config.controller';

describe('CnCoreConfigController', () => {
  let controller: HnCoreConfigController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HnCoreConfigController],
    }).compile();

    controller = module.get<HnCoreConfigController>(HnCoreConfigController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
