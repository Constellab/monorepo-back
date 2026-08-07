import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { BL_REFRESH_TOKEN_SERVICE_PROVIDER } from './bl-refresh-token.class';
import { BlRefreshTokenService } from './bl-refresh-token.service';

@Injectable()
export class BlRefreshTokenCron {
  private readonly logger = new Logger(BlRefreshTokenCron.name);

  constructor(
    @Inject(BL_REFRESH_TOKEN_SERVICE_PROVIDER) private refreshTokenService: BlRefreshTokenService
  ) {}

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
