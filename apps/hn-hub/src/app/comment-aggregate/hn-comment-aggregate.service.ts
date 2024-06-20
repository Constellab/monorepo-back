import {Injectable} from '@nestjs/common';
import {HnCommentStoryService} from './comment-story/hn-comment-story.service';
import {ClPage} from '@monorepo/core-lib';
import {HnCommentLiveTaskService} from './comment-live-task/hn-comment-live-task.service';
import {HnEntityType} from '../core/model/entities/hn-entity-type.enum';
import {BlEntityWithId, BlRichTextContent} from '@monorepo/back-core-lib';
import {HnAbstractCommentService} from './comment-core/hn-abstract-comment.service';
import {HnAbstractCommentDto} from './comment-core/hn-abstract-comment.dto';

@Injectable()
export class HnCommentAggregateService {
  constructor(private readonly commentStoryService: HnCommentStoryService,
              private readonly commentLiveTaskService: HnCommentLiveTaskService) {
  }

  async getComments(commentType: HnEntityType, entityId: string,
                    page: number, size: number): Promise<ClPage<HnAbstractCommentDto<BlEntityWithId>>> {
    return this.getService(commentType).getComments(page, size, entityId);
  }

  async createComment(commentType: HnEntityType, entityId: string,
                      comment: BlRichTextContent): Promise<HnAbstractCommentDto<BlEntityWithId>> {
    return new HnAbstractCommentDto<BlEntityWithId>(await this.getService(commentType).comment(entityId, comment));
  }

  private getService(likeType: HnEntityType): HnAbstractCommentService<BlEntityWithId> {
    switch (likeType) {
      case HnEntityType.STORY_LIKE:
        return this.commentStoryService;
      case HnEntityType.LIVE_TASK_LIKE:
        return this.commentLiveTaskService;
      default:
        throw new Error('Unknown comment type')
    }
  }
}
