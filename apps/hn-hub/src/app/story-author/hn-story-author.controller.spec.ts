import { Test, TestingModule } from '@nestjs/testing';
import { HnStoryAuthorController } from './hn-story-author.controller';
import { HnStoryAuthorService } from './hn-story-author.service';

describe('HnStoryAuthorController', () => {
  let controller: HnStoryAuthorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HnStoryAuthorController],
      providers: [HnStoryAuthorService],
    }).compile();

    controller = module.get<HnStoryAuthorController>(HnStoryAuthorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
