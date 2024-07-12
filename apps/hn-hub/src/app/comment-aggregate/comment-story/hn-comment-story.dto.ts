import {HnAbstractCommentDto} from '../comment-core/hn-abstract-comment.dto';
import {HnCommentStory} from './hn-comment-story.entity';
import {HnStory} from '../../story/hn-story.entity';
import {HnStoryDto} from '../../story/hn-story.dto';

export class HnCommentStoryDto extends HnAbstractCommentDto<HnStoryDto> {
  entity: HnStoryDto;

  constructor(commentStory: HnCommentStory) {
    super(commentStory);
    this.entity = new HnStoryDto(commentStory.entity as HnStory);
  }
}
