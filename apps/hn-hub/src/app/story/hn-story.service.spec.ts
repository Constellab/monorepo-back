import { Test, TestingModule } from '@nestjs/testing';
import { HnStoryService } from './hn-story.service';

describe('StoryService', () => {
  let service: HnStoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HnStoryService],
    }).compile();

    service = module.get<HnStoryService>(HnStoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
