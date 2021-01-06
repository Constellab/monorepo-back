import { Test, TestingModule } from '@nestjs/testing';
import { ServersInfoController } from './servers-info.controller';

describe('ServersInfoController', () => {
  let controller: ServersInfoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServersInfoController],
    }).compile();

    controller = module.get<ServersInfoController>(ServersInfoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
