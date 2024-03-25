import {Controller} from '@nestjs/common';
import {HnCommentAggregateService} from './hn-comment-aggregate.service';

@Controller('comment-story')
export class HnCommentStoryController {
  constructor(private readonly commentAggregateService: HnCommentAggregateService) {
  }


}
