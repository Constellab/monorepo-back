import { Injectable } from '@nestjs/common';
import { blTransportSpaceUserQueue } from '@monorepo/back-core-lib';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { HnUserService } from './hn-user.service';
import { HnUserConstellabDTO } from './hn-user.entity';

@Processor(blTransportSpaceUserQueue)
@Injectable()
export class CnUserProcessor extends WorkerHost {
  constructor(private userService: HnUserService) {
    super();
  }

  async process(job: Job<HnUserConstellabDTO>): Promise<void> {
    await this.userService.createOrUpdate(job.data);
  }
}
