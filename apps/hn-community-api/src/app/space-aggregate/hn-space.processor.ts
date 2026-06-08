import {
  BL_TRANSPORT_SPACE_SPACE_USER_QUEUE,
  BlTransportSpaceDeletePayload,
  BlTransportSpaceUserCreateOrUpdatePayload,
  BlTransportSpaceUserPattern,
  BlTransportSpaceUserRemovePayload,
} from '@monorepo/back-core-lib';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';

import { HnSpaceAggregateService } from './hn-space-aggregate.service';

@Processor(BL_TRANSPORT_SPACE_SPACE_USER_QUEUE)
@Injectable()
export class HnSpaceProcessor extends WorkerHost {
  private readonly logger = new Logger(HnSpaceProcessor.name);

  constructor(private spaceAggregateService: HnSpaceAggregateService) {
    super();
  }

  async process(job: Job): Promise<void> {
    switch (job.name as BlTransportSpaceUserPattern) {
      case BlTransportSpaceUserPattern.CREATE:
      case BlTransportSpaceUserPattern.UPDATE:
        await this.processCreateOrUpdate(job as Job<BlTransportSpaceUserCreateOrUpdatePayload>);
        break;
      case BlTransportSpaceUserPattern.REMOVE:
        await this.processRemove(job as Job<BlTransportSpaceUserRemovePayload>);
        break;
      case BlTransportSpaceUserPattern.DELETE:
        await this.processDeleteSpace(job as Job<BlTransportSpaceDeletePayload>);
        break;
    }
  }

  private async processCreateOrUpdate(job: Job<BlTransportSpaceUserCreateOrUpdatePayload>): Promise<void> {
    await this.spaceAggregateService.createOrUpdateSpaceUser(job.data).catch((e) => {
      this.logger.error(`Error while processing job ${job.id} ${job.name} : ${e.message}`);
      throw e;
    });
  }

  private async processRemove(job: Job<BlTransportSpaceUserRemovePayload>): Promise<void> {
    await this.spaceAggregateService.deleteSpaceUser(job.data).catch((e) => {
      this.logger.error(`Error while processing job ${job.id} ${job.name} : ${e.message}`);
      throw e;
    });
  }

  private async processDeleteSpace(job: Job<BlTransportSpaceDeletePayload>): Promise<void> {
    await this.spaceAggregateService.deleteSpace(job.data).catch((e) => {
      this.logger.error(`Error while processing job ${job.id} ${job.name} : ${e.message}`);
      throw e;
    });
  }
}
