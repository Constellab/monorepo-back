import { Test, TestingModule } from '@nestjs/testing';
import { DnBrickController } from './dn-brick.controller';
import { DnBrickService } from './dn-brick.service';

describe('DnBrickController', () => {
  let controller: DnBrickController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DnBrickController],
      providers: [DnBrickService],
    }).compile();

    controller = module.get<DnBrickController>(DnBrickController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
