import {Injectable} from '@nestjs/common';
import {OnEvent} from '@nestjs/event-emitter';
import {
  CnProjectDocumentEvent,
  cnProjectDocumentEventName
} from '../cn-projects-aggregate/cn-project-documents/cn-project-document.event';
import {CnSpaceAggregateService} from './cn-space-aggregate.service';


@Injectable()
export class CnSpaceListener {

  constructor(private spaceAggregatorService: CnSpaceAggregateService) {
  }

  @OnEvent(cnProjectDocumentEventName)
  async handleProjectEvent(event: CnProjectDocumentEvent): Promise<void> {
    // When a document is uploaded in a space, we need to refresh the space storage usage
    await this.spaceAggregatorService.refreshSpaceStorageUsage(event.spaceId);
  }
}
