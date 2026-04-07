import { BlBadRequestException, BlEntityWithId } from '@monorepo/back-core-lib';
import { Injectable } from '@nestjs/common';

import { HnEntityType } from '../core/model/entities/hn-entity-type.enum';
import { HnCurrentUserHelper } from '../core/utils/hn-current-user.helper';
import { HnLikeAgentService } from './like-agent/hn-like-agent.service';
import { HnLikeAppService } from './like-app/hn-like-app.service';
import { HnLikeBrickService } from './like-brick/hn-like-brick.service';
import { HnAbstractLikeService } from './like-core/hn-abstract-like.service';
import { HnLikePartnerService } from './like-partner/hn-like-partner.service';
import { HnLikeStoryService } from './like-story/hn-like-story.service';
import { HnLikeTagService } from './like-tag/hn-like-tag.service';

@Injectable()
export class HnLikeAggregateService {
  constructor(
    private readonly likeStoryService: HnLikeStoryService,
    private readonly likeAgentService: HnLikeAgentService,
    private readonly likeBrickService: HnLikeBrickService,
    private readonly likeAppService: HnLikeAppService,
    private readonly likeTagService: HnLikeTagService,
    private readonly likePartnerService: HnLikePartnerService
  ) {}

  async checkIfIsLiked(entityId: string, likeType: HnEntityType): Promise<boolean> {
    if (HnCurrentUserHelper.getCurrentUser() == null) {
      return false;
    }
    return this.getService(likeType).checkIfLiked(entityId);
  }

  async getLikeCount(entityId: string, likeType: HnEntityType): Promise<number> {
    return this.getService(likeType).getNumberOfLikes(entityId);
  }

  async like(entityId: string, likeType: HnEntityType): Promise<number> {
    return this.getService(likeType).like(likeType, entityId);
  }

  async unlike(entityId: string, likeType: HnEntityType): Promise<number> {
    return this.getService(likeType).unlike(likeType, entityId);
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
      case HnEntityType.TAG:
        return this.likeTagService;
      case HnEntityType.PARTNER:
        return this.likePartnerService;
      default:
        throw new BlBadRequestException('Unknown like type');
    }
  }
}
