import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { HnCommentEventData, HnEventType, HnLikeEventData } from '../core/utils/hn-events.enum';
import { HnAgentService } from './agent/hn-agent.service';

@Injectable()
export class HnAgentListener {
  constructor(private agentService: HnAgentService) {}

  @OnEvent(HnEventType.AGENT_COMMENT)
  async handleAppCommentCreatedEvent(event: HnCommentEventData): Promise<void> {
    await this.agentService.updateComments(event.entityId, event.numberOfComments);
  }

  @OnEvent(HnEventType.AGENT_LIKE)
  async handleAppLikeCreatedEvent(event: HnLikeEventData): Promise<void> {
    await this.agentService.updateLikes(event.entityId, event.numberOfLikes);
  }
}
