import { Test, TestingModule } from '@nestjs/testing';
import { BricksController } from './bricks.controller';

describe('BricksController', () => {
  let controller: BricksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BricksController],
    }).compile();

    controller = module.get<BricksController>(BricksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
