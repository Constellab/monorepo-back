import { Test, TestingModule } from '@nestjs/testing';
import { DnCoreConfigController } from './dn-core-config.controller';

describe('CoreConfigController', () => {
  let controller: DnCoreConfigController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DnCoreConfigController],
    }).compile();

    controller = module.get<DnCoreConfigController>(DnCoreConfigController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
