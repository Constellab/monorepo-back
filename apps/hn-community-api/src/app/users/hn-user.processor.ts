import { blTransportSpaceUserQueue } from '@monorepo/back-core-lib';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';

import { HnUserConstellabDTO } from './hn-user.entity';
import { HnUserService } from './hn-user.service';

@Processor(blTransportSpaceUserQueue)
@Injectable()
export class HnUserProcessor extends WorkerHost {
  private readonly logger = new Logger(HnUserProcessor.name);

  constructor(private userService: HnUserService) {
    super();
  }

  async process(job: Job<HnUserConstellabDTO>): Promise<void> {
    await this.userService.createOrUpdate(job.data).catch((e) => {
      this.logger.error(`Error while processing job ${job.id} ${job.name} : ${e.message}`);
      throw e;
    });
  }
}
