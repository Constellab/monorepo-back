import { Injectable } from '@nestjs/common';
import { blTransportCommunityBrickQueue } from '@monorepo/back-core-lib';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { CnBricksService } from './cn-bricks.service';
import { CnBrickSaveDTO } from './cn-brick.dto';

@Processor(blTransportCommunityBrickQueue)
@Injectable()
export class CnBricksProcessor extends WorkerHost {
  constructor(private service: CnBricksService) {
    super();
  }

  async process(job: Job<CnBrickSaveDTO>): Promise<void> {
    await this.service.saveBrick(job.data);
  }
}
