import {Test, TestingModule} from '@nestjs/testing';
import {CnServersInfoController} from './cn-servers-info.controller';

describe('ServersInfoController', () => {
  let controller: CnServersInfoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CnServersInfoController],
    }).compile();

    controller = module.get<CnServersInfoController>(CnServersInfoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
