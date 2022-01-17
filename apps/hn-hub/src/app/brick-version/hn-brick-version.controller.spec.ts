import { Test, TestingModule } from '@nestjs/testing';
import { HnBrickVersionController } from './hn-brick-version.controller';
import { HnBrickVersionService } from './hn-brick-version.service';

describe('HnBrickVersionController', () => {
  let controller: HnBrickVersionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HnBrickVersionController],
      providers: [HnBrickVersionService],
    }).compile();

    controller = module.get<HnBrickVersionController>(HnBrickVersionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
