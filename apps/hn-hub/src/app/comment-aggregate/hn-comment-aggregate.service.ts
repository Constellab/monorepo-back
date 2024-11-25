import { Injectable } from '@nestjs/common';
import { HnCommentStoryService } from './comment-story/hn-comment-story.service';
import { ClPage } from '@monorepo/core-lib';
import { HnCommentAgentService } from './comment-agent/hn-comment-agent.service';
import { HnEntityType } from '../core/model/entities/hn-entity-type.enum';
import { BlEntityWithId } from '@monorepo/back-core-lib';
import { HnAbstractCommentService } from './comment-core/hn-abstract-comment.service';
import { HnAbstractCommentDto } from './comment-core/hn-abstract-comment.dto';
import { TeRichText } from '@monorepo/te-text-editor';

@Injectable()
export class HnCommentAggregateService {
  constructor(
    private readonly commentStoryService: HnCommentStoryService,
    private readonly commentAgentService: HnCommentAgentService
  ) {}

  async getComments(
    commentType: HnEntityType,
    entityId: string,
    page: number,
    size: number
  ): Promise<ClPage<HnAbstractCommentDto<BlEntityWithId>>> {
    return this.getService(commentType).getComments(page, size, entityId);
  }

  async createComment(
    commentType: HnEntityType,
    entityId: string,
    comment: TeRichText
  ): Promise<HnAbstractCommentDto<BlEntityWithId>> {
    return new HnAbstractCommentDto<BlEntityWithId>(
      await this.getService(commentType).comment(entityId, comment)
    );
  }

  private getService(likeType: HnEntityType): HnAbstractCommentService<BlEntityWithId> {
    switch (likeType) {
      case HnEntityType.STORY_LIKE:
        return this.commentStoryService;
      case HnEntityType.AGENT_LIKE:
        return this.commentAgentService;
      default:
        throw new Error('Unknown comment type');
    }
  }
}
