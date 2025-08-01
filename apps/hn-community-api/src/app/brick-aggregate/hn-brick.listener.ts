import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { HnEventType, HnLikeEventData } from '../core/utils/hn-events.enum';
import { HnBrickService } from './brick/hn-brick.service';

@Injectable()
export class HnBrickListener {
  constructor(private brickService: HnBrickService) {}

  @OnEvent(HnEventType.BRICK_LIKE)
  async handleAppLikeCreatedEvent(event: HnLikeEventData): Promise<void> {
    await this.brickService.updateLikes(event.entityId, event.numberOfLikes);
  }
}
