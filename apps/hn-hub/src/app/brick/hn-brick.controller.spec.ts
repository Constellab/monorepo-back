import { Test, TestingModule } from '@nestjs/testing';
import { HnBrickController } from './hn-brick.controller';
import { HnBrickService } from './hn-brick.service';

describe('HnBrickController', () => {
  let controller: HnBrickController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HnBrickController],
      providers: [HnBrickService],
    }).compile();

    controller = module.get<HnBrickController>(HnBrickController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
