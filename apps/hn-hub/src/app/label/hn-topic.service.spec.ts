import { Test, TestingModule } from '@nestjs/testing';
import { HnTopicService } from './hn-topic.service';

describe('HnTopicService', () => {
  let service: HnTopicService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HnTopicService],
    }).compile();

    service = module.get<HnTopicService>(HnTopicService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
