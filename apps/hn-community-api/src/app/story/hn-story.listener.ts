import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { HnCommentEventData, HnEventType, HnLikeEventData } from '../core/utils/hn-events.enum';
import { HnStoryService } from './hn-story.service';

@Injectable()
export class HnCommunityStoryListener {
  constructor(private storyService: HnStoryService) {}

  @OnEvent(HnEventType.STORY_COMMENT)
  async handleStoryCommentCreatedEvent(event: HnCommentEventData): Promise<void> {
    await this.storyService.updateComments(event.entityId, event.numberOfComments);
  }

  @OnEvent(HnEventType.STORY_LIKE)
  async handleStoryLikeCreatedEvent(event: HnLikeEventData): Promise<void> {
    await this.storyService.updateLikes(event.entityId, event.numberOfLikes);
  }
}
