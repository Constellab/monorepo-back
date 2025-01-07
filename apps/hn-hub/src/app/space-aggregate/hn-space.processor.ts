import { Injectable, Logger } from '@nestjs/common';
import { blTransportSpaceSpaceUserQueue, BlTransportSpaceUserPattern } from '@monorepo/back-core-lib';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { HnSpaceAggregateService } from './hn-space-aggregate.service';
import { HnSpaceUser } from './space-user/hn-space-user.entity';

@Processor(blTransportSpaceSpaceUserQueue)
@Injectable()
export class HnSpaceProcessor extends WorkerHost {
  private readonly logger = new Logger(HnSpaceProcessor.name);

  constructor(private spaceAggregateService: HnSpaceAggregateService) {
    super();
  }

  async process(job: Job<HnSpaceUser, any, BlTransportSpaceUserPattern>): Promise<void> {
    switch (job.name) {
      case BlTransportSpaceUserPattern.CREATE:
      case BlTransportSpaceUserPattern.UPDATE:
        await this.spaceAggregateService.createOrUpdateSpaceUser(job.data).catch((e) => {
          this.logger.error(`Error while processing job ${job.id} ${job.name} : ${e.message}`);
          throw e;
        });
        break;
      case BlTransportSpaceUserPattern.REMOVE:
        await this.spaceAggregateService.deleteSpaceUser(job.data).catch((e) => {
          this.logger.error(`Error while processing job ${job.id} ${job.name} : ${e.message}`);
          throw e;
        });
        break;
      case BlTransportSpaceUserPattern.DELETE:
        await this.spaceAggregateService.deleteSpace(job.data).catch((e) => {
          this.logger.error(`Error while processing job ${job.id} ${job.name} : ${e.message}`);
          throw e;
        });
        break;
    }
  }
}
