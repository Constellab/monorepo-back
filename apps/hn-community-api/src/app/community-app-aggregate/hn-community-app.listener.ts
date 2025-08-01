import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { HnCommentEventData, HnEventType, HnLikeEventData } from '../core/utils/hn-events.enum';
import { HnCommunityAppService } from './community-app/hn-community-app.service';

@Injectable()
export class HnCommunityAppListener {
  constructor(private communityAppService: HnCommunityAppService) {}

  @OnEvent(HnEventType.APP_COMMENT)
  async handleAppCommentCreatedEvent(event: HnCommentEventData): Promise<void> {
    await this.communityAppService.updateComments(event.entityId, event.numberOfComments);
  }

  @OnEvent(HnEventType.APP_LIKE)
  async handleAppLikeCreatedEvent(event: HnLikeEventData): Promise<void> {
    await this.communityAppService.updateLikes(event.entityId, event.numberOfLikes);
  }
}
