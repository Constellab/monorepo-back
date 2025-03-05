import { Injectable } from '@nestjs/common';
import { HnLikeStoryService } from './like-story/hn-like-story.service';
import { HnCurrentUserHelper } from '../core/utils/hn-current-user.helper';
import { HnLikeAgentService } from './like-agent/hn-like-agent.service';
import { HnLikeBrickService } from './like-brick/hn-like-brick.service';
import { BlEntityWithId } from '@monorepo/back-core-lib';
import { HnAbstractLikeService } from './like-core/hn-abstract-like.service';
import { HnEntityType } from '../core/model/entities/hn-entity-type.enum';
import { HnLikeAppService } from './like-app/hn-like-app.service';

@Injectable()
export class HnLikeAggregateService {
  constructor(
    private readonly likeStoryService: HnLikeStoryService,
    private readonly likeAgentService: HnLikeAgentService,
    private readonly likeBrickService: HnLikeBrickService,
    private readonly likeAppService: HnLikeAppService
  ) {}

  async checkIfIsLiked(entityId: string, likeType: HnEntityType): Promise<boolean> {
    if (HnCurrentUserHelper.getCurrentUser() == null) {
      return false;
    }
    return this.getService(likeType).checkIfLiked(entityId);
  }

  async like(entityId: string, likeType: HnEntityType): Promise<BlEntityWithId> {
    return this.getService(likeType).like(entityId);
  }

  async unlike(entityId: string, likeType: HnEntityType): Promise<BlEntityWithId> {
    return this.getService(likeType).unlike(entityId);
  }

  private getService(likeType: HnEntityType): HnAbstractLikeService<BlEntityWithId> {
    switch (likeType) {
      case HnEntityType.STORY:
        return this.likeStoryService;
      case HnEntityType.AGENT:
        return this.likeAgentService;
      case HnEntityType.BRICK:
        return this.likeBrickService;
      case HnEntityType.APP:
        return this.likeAppService;
      default:
        throw new Error('Unknown like type');
    }
  }
}
