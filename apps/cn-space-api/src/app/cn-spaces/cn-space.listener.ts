import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CnDocumentEvent, cnDocumentEventName } from '../cn-folders-aggregate/cn-documents/cn-document.event';
import { CnSpaceAggregateService } from './cn-space-aggregate.service';

@Injectable()
export class CnSpaceListener {
  constructor(private spaceAggregatorService: CnSpaceAggregateService) {}

  @OnEvent(cnDocumentEventName)
  async handleDocumentEvent(event: CnDocumentEvent): Promise<void> {
    // When a document is uploaded in a space, we need to refresh the space storage usage
    await this.spaceAggregatorService.refreshSpaceStorageUsage(event.spaceId);
  }
}
