import { Test, TestingModule } from '@nestjs/testing';
import { CnExternalLabsController } from './cn-external-labs.controller';

describe('ExternalLabsController', () => {
  let controller: CnExternalLabsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CnExternalLabsController],
    }).compile();

    controller = module.get<CnExternalLabsController>(CnExternalLabsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
