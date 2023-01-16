import { Controller } from '@nestjs/common';
import { HnStoryService } from './hn-story.service';

@Controller('story')
export class HnStoryController {
  constructor(private readonly storyService: HnStoryService) {


  }
}
