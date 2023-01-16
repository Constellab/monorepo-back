import { Test, TestingModule } from '@nestjs/testing';
import { HnTopicController } from './hn-topic.controller';
import { HnTopicService } from './hn-topic.service';

describe('HnTopicController', () => {
  let controller: HnTopicController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HnTopicController],
      providers: [HnTopicService],
    }).compile();

    controller = module.get<HnTopicController>(HnTopicController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
