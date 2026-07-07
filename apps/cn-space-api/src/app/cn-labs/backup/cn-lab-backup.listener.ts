import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { CnLabMailService } from '../mail/cn-lab-mail.service';
import { CN_LAB_BACKUP_EVENT_NAME, CnLabBackupEvent } from './cn-lab-backup.event';

@Injectable()
export class CnLabBackupListener {
  protected readonly logger = new Logger(CnLabBackupListener.name);

  // Cache to track recently sent emails: labId -> timestamp
  private emailSentCache = new Map<string, number>();

  // Cooldown period in milliseconds (5 minutes)
  private readonly COOLDOWN_PERIOD = 5 * 60 * 1000;

  constructor(private labMailService: CnLabMailService) {}

  @OnEvent(CN_LAB_BACKUP_EVENT_NAME)
  async handleBackupEvent(event: CnLabBackupEvent): Promise<void> {
    try {
      if (event.payload.type === 'BACKUP_STATUS_ERROR') {
        // Check if we recently sent an email for this lab
        const lastSent = this.emailSentCache.get(event.lab.id);
        const now = Date.now();

        if (lastSent && now - lastSent < this.COOLDOWN_PERIOD) {
          const minutesAgo = Math.round((now - lastSent) / 1000 / 60);
          this.logger.log(`Skipping backup error email for lab ${event.lab.id} - sent ${minutesAgo} min ago`);
          return;
        }

        // Send the email
        await this.labMailService.sendLabBackupErrorMail(event.lab);

        // Update the cache
        this.emailSentCache.set(event.lab.id, now);

        // Clean up old entries periodically to prevent memory leak
        this.cleanupCache();
      }
    } catch (error: any) {
      this.logger.error(
        `[CnLabBackupListener] Error while handling backup event ${event.payload.type}. Error ${error}`
      );
      if (error.stack) {
        this.logger.error(error.stack);
      }
      throw error;
    }
  }

  /**
   * Remove old entries from the cache to prevent memory leaks
   * @private
   */
  private cleanupCache(): void {
    const now = Date.now();
    for (const [labId, timestamp] of this.emailSentCache.entries()) {
      if (now - timestamp > this.COOLDOWN_PERIOD) {
        this.emailSentCache.delete(labId);
      }
    }
  }
}
