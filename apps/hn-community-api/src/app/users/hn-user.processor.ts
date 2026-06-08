import { BL_TRANSPORT_SPACE_USER_QUEUE, BlTransportUserPattern } from '@monorepo/back-core-lib';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';

import { HnUserService } from './hn-user.service';

@Processor(BL_TRANSPORT_SPACE_USER_QUEUE)
@Injectable()
export class HnUserProcessor extends WorkerHost {
  private readonly logger = new Logger(HnUserProcessor.name);

  constructor(private userService: HnUserService) {
    super();
  }

  async process(job: Job): Promise<void> {
    switch (job.name as BlTransportUserPattern) {
      case BlTransportUserPattern.DELETE:
        await this.userService.delete(job.data.userId).catch((e) => {
          this.logger.error(`Error while processing job ${job.id} ${job.name} : ${e.message}`);
          throw e;
        });
        break;
      case BlTransportUserPattern.CREATE_OR_UPDATE:
      default:
        await this.userService.createOrUpdate(job.data).catch((e) => {
          this.logger.error(`Error while processing job ${job.id} ${job.name} : ${e.message}`);
          throw e;
        });
        break;
    }
  }
}
