import { Test, TestingModule } from '@nestjs/testing';

import { CnBricksController } from './cn-bricks.controller';

describe('BricksController', () => {
  let controller: CnBricksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CnBricksController],
    }).compile();

    controller = module.get<CnBricksController>(CnBricksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
