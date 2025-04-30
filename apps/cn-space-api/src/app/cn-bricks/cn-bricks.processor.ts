import { Injectable, Logger } from '@nestjs/common';
import { blTransportCommunityBrickQueue } from '@monorepo/back-core-lib';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { CnBricksService } from './cn-bricks.service';
import { CnBrickSaveDTO } from './cn-brick.dto';

@Processor(blTransportCommunityBrickQueue)
@Injectable()
export class CnBricksProcessor extends WorkerHost {
  private readonly logger = new Logger(CnBricksProcessor.name);

  constructor(private service: CnBricksService) {
    super();
  }

  async process(job: Job<CnBrickSaveDTO>): Promise<void> {
    await this.service.saveBrick(job.data).catch((e) => {
      this.logger.error(`Error while processing job ${job.id} ${job.name} : ${e.message}`);
      throw e;
    });
  }
}
