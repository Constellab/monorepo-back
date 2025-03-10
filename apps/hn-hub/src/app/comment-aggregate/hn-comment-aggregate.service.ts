import { Injectable } from '@nestjs/common';
import { HnCommentStoryService } from './comment-story/hn-comment-story.service';
import { ClPage } from '@monorepo/core-lib';
import { HnCommentAgentService } from './comment-agent/hn-comment-agent.service';
import { HnEntityType } from '../core/model/entities/hn-entity-type.enum';
import { BlEntityWithId } from '@monorepo/back-core-lib';
import { HnAbstractCommentService } from './comment-core/hn-abstract-comment.service';
import { HnAbstractCommentDto } from './comment-core/hn-abstract-comment.dto';
import { TeRichText } from '@monorepo/te-text-editor';
import { HnCommentAppService } from './comment-app/hn-comment-app.service';
import { HnCommentEntity } from './comment-core/hn-comment.entity';

@Injectable()
export class HnCommentAggregateService {
  constructor(
    private readonly commentStoryService: HnCommentStoryService,
    private readonly commentAgentService: HnCommentAgentService,
    private readonly commentAppService: HnCommentAppService
  ) {}

  async getComments(
    commentType: HnEntityType,
    entityId: string,
    page: number,
    size: number
  ): Promise<ClPage<HnCommentEntity<any>>> {
    return this.getService(commentType).getComments(page, size, entityId);
  }

  async createComment(
    commentType: HnEntityType,
    entityId: string,
    comment: TeRichText
  ): Promise<HnAbstractCommentDto> {
    return new HnAbstractCommentDto(
      await this.getService(commentType).comment(commentType, entityId, comment)
    );
  }

  private getService(likeType: HnEntityType): HnAbstractCommentService<BlEntityWithId> {
    switch (likeType) {
      case HnEntityType.STORY:
        return this.commentStoryService;
      case HnEntityType.AGENT:
        return this.commentAgentService;
      case HnEntityType.APP:
        return this.commentAppService;
      default:
        throw new Error('Unknown comment type');
    }
  }
}
