import { WorkerHost } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import { Job } from 'bullmq';

import { BlMailQueue } from './bl-mail.class';
import { BlMailSenderService } from './bl-mail-sender.service';

export abstract class BlMailProcessor extends WorkerHost {
  private readonly logger = new Logger(BlMailProcessor.name);

  @Inject(BlMailSenderService) private mailService: BlMailSenderService;

  async process(job: Job<BlMailQueue>): Promise<void> {
    // no need to catch error because it is already logged in BlMailSenderService
    await this.mailService.sendMailSync(job.data);
  }
}
