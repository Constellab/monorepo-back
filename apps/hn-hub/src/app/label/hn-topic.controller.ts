import { Controller } from '@nestjs/common';
import { HnTopicService } from './hn-topic.service';

@Controller('hn-story-label')
export class HnTopicController {
  constructor(private readonly hnTopicService: HnTopicService) {}
}
