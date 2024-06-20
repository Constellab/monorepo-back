import {HnAbstractCommentDto} from '../comment-core/hn-abstract-comment.dto';
import {HnLiveTaskDto} from '../../live-task-aggregate/live-task/hn-live-task.dto';
import {HnCommentLiveTask} from './hn-comment-live-task.entity';
import {HnLiveTask} from '../../live-task-aggregate/live-task/hn-live-task.entity';

export class HnCommentLiveTaskDto extends HnAbstractCommentDto<HnLiveTaskDto> {
  entity: HnLiveTaskDto;

  constructor(commentStory: HnCommentLiveTask) {
    super(commentStory);
    this.entity = new HnLiveTaskDto(commentStory.entity as HnLiveTask);
  }
}
