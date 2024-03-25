import {Injectable} from '@nestjs/common';
import {HnCommentStoryService} from './comment-story/hn-comment-story.service';

@Injectable()
export class HnCommentAggregateService {
  constructor(private readonly commentStoryService: HnCommentStoryService) {
  }

  ///////////////////////// COMMENT STORY /////////////////////////////

}
