import { Controller } from '@nestjs/common';
import { HnStoryAuthorService } from './hn-story-author.service';

@Controller('hn-story-author')
export class HnStoryAuthorController {
  constructor(private readonly hnStoryAuthorService: HnStoryAuthorService) {}
}
