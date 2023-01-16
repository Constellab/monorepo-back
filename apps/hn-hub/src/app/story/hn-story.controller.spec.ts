import { Test, TestingModule } from '@nestjs/testing';
import { HnStoryController } from './hn-story.controller';
import { HnStoryService } from './hn-story.service';

describe('StoryController', () => {
  let controller: HnStoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HnStoryController],
      providers: [HnStoryService],
    }).compile();

    controller = module.get<HnStoryController>(HnStoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
