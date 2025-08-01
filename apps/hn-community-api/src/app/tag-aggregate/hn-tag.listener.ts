import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { HnCommentEventData, HnEventType, HnLikeEventData } from '../core/utils/hn-events.enum';
import { HnTagKeyService } from './tag-key/hn-tag-key.service';

@Injectable()
export class HnTagListener {
  constructor(private tagKeyService: HnTagKeyService) {}

  @OnEvent(HnEventType.TAG_LIKE)
  async handleTagLikeCreatedEvent(event: HnLikeEventData): Promise<void> {
    await this.tagKeyService.updateLikes(event.entityId, event.numberOfLikes);
  }

  @OnEvent(HnEventType.TAG_COMMENT)
  async handleTagCommentCreatedEvent(event: HnCommentEventData): Promise<void> {
    await this.tagKeyService.updateComments(event.entityId, event.numberOfComments);
  }
}
