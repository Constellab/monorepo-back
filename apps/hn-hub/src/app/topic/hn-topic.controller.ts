import {Controller, Get} from '@nestjs/common';
import { HnTopicService } from './hn-topic.service';
import {HnTopic} from './hn-topic.entity';
import {BlPublic} from '@monorepo/back-core-lib';

@Controller('topic')

export class HnTopicController {
  constructor(private readonly topicService: HnTopicService) {
  }

  @BlPublic()
  @Get()
  getTopics(): Promise<HnTopic[]>{
    return this.topicService.getTopics();
}

  @BlPublic()
  @Get('popular')
  getPopularTopics(): Promise<HnTopic[]>{
    return this.topicService.getMostPopularTopics();
  }
}
