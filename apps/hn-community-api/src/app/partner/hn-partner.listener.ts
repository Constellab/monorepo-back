import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { HnEventType } from '../core/utils/hn-events.enum';
import { HnPartnerService } from './hn-partner.service';

@Injectable()
export class HnPartnerListener {
  constructor(private partnerService: HnPartnerService) {}

  @OnEvent(HnEventType.PARTNER_COMMENT)
  async handlePartnerCommentCreatedEvent(event: {
    entityId: string;
    numberOfComments: number;
  }): Promise<void> {
    await this.partnerService.updateComments(event.entityId, event.numberOfComments);
  }

  @OnEvent(HnEventType.PARTNER_LIKE)
  async handlePartnerLikeCreatedEvent(event: { entityId: string; numberOfLikes: number }): Promise<void> {
    await this.partnerService.updateLikes(event.entityId, event.numberOfLikes);
  }
}
