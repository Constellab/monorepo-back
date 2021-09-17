import { Test, TestingModule } from '@nestjs/testing';
import { CoreConfigController } from './core-config.controller';

describe('CoreConfigController', () => {
  let controller: CoreConfigController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CoreConfigController],
    }).compile();

    controller = module.get<CoreConfigController>(CoreConfigController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
