import { Test, TestingModule } from '@nestjs/testing';
import { HnLabelController } from './hn-label.controller';
import { HnLabelService } from './hn-label.service';

describe('HnStoryLabelController', () => {
  let controller: HnLabelController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HnLabelController],
      providers: [HnLabelService],
    }).compile();

    controller = module.get<HnLabelController>(HnLabelController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
