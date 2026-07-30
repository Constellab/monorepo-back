import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { HnRefreshTokenService } from './hn-refresh-token.service';

@Injectable()
export class HnRefreshTokenCron {
  private readonly logger = new Logger(HnRefreshTokenCron.name);

  constructor(private refreshTokenService: HnRefreshTokenService) {}

  /**
   * Clears rows whose refresh token has expired.
   */
  @Cron('0 30 3 * * *') // cron every day at 03:30
  async deleteExpiredRefreshTokens(): Promise<void> {
    this.logger.log('[Cron] Start of expired refresh token cleanup');

    const deleted: number = await this.refreshTokenService.deleteExpired();

    this.logger.log(`[Cron] End of expired refresh token cleanup, ${deleted} row(s) deleted`);
  }
}
