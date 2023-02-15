import { Test, TestingModule } from '@nestjs/testing';
import { HnStoryAuthorService } from './hn-story-author.service';

describe('HnStoryAuthorService', () => {
  let service: HnStoryAuthorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HnStoryAuthorService],
    }).compile();

    service = module.get<HnStoryAuthorService>(HnStoryAuthorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
