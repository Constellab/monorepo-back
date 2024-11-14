import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Inject } from '@nestjs/common';
import { BlMailQueue } from './bl-mail.class';
import { BlMailSenderService } from './bl-mail-sender.service';

export abstract class BlMailProcessor extends WorkerHost {
  @Inject(BlMailSenderService) private mailService: BlMailSenderService;

  async process(job: Job<BlMailQueue>): Promise<void> {
    await this.mailService.sendMailSync(job.data);
  }
}
