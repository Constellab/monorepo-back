import { ClDateHelper } from '@monorepo/core-lib';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash, randomBytes } from 'crypto';
import { DateTime } from 'luxon';
import { LessThan, Repository } from 'typeorm';

import { HnCoreConfigService } from '../../core/modules/core-config/hn-core-config.service';
import { HnUser } from '../../users/hn-user.entity';
import { HnRefreshToken, HnRefreshTokenKind } from './hn-refresh-token.entity';

/** OAuth-only binding carried by the token, replayed when the access token is renewed. */
export interface HnRefreshTokenOAuthBinding {
  clientId: string;
  resource: string;
}

/** What a successful rotation yields: the new token, plus everything needed to mint an access token. */
export interface HnRefreshTokenRotation {
  token: string;
  user: HnUser;
  clientId: string | null;
  resource: string | null;
}

@Injectable()
export class HnRefreshTokenService {
  constructor(
    @InjectRepository(HnRefreshToken)
    private readonly repository: Repository<HnRefreshToken>,
    private readonly configService: HnCoreConfigService
  ) {}

  /**
   * Create a session and return its refresh token — the only moment
   * it exists in clear anywhere. Only its hash is persisted.
   */
  async issue(
    user: HnUser,
    kind: HnRefreshTokenKind,
    oauthBinding?: HnRefreshTokenOAuthBinding
  ): Promise<string> {
    const token = HnRefreshTokenService.generateToken();

    const entity = this.repository.create({
      tokenHash: HnRefreshTokenService.hash(token),
      kind,
      user,
      expiresAt: this.expiryFromNow(),
      clientId: oauthBinding?.clientId ?? null,
      resource: oauthBinding?.resource ?? null,
      createdAt: ClDateHelper.getDate(),
    });
    await this.repository.save(entity);

    return token;
  }

  /**
   * Consume a refresh token and replace it, atomically.
   *
   * Returns null when the token is unknown, expired, of the wrong kind, or already
   * consumed. All four are indistinguishable to the caller on purpose.
   */
  async rotate(presentedToken: string, kind: HnRefreshTokenKind): Promise<HnRefreshTokenRotation | null> {
    const presentedHash = HnRefreshTokenService.hash(presentedToken);

    const existing = await this.repository.findOne({
      where: { tokenHash: presentedHash, kind },
      relations: { user: true },
    });
    if (existing == null || existing.expiresAt < ClDateHelper.getDate()) {
      return null;
    }

    const newToken = HnRefreshTokenService.generateToken();
    // Update the actual row with the new token and expiry
    const result = await this.repository.update(
      { tokenHash: presentedHash },
      {
        tokenHash: HnRefreshTokenService.hash(newToken),
        expiresAt: this.expiryFromNow(),
      }
    );

    // Zero rows means another request rotated this token first: reject rather than
    // hand out a second valid token for the same session.
    if (result.affected !== 1) {
      return null;
    }

    return {
      token: newToken,
      user: existing.user,
      clientId: existing.clientId,
      resource: existing.resource,
    };
  }

  /**
   * Revoke a session. Silent when the token is unknown — a logout carrying a stale
   * cookie should still succeed.
   */
  async revoke(presentedToken: string): Promise<void> {
    await this.repository.delete({ tokenHash: HnRefreshTokenService.hash(presentedToken) });
  }

  /** Drop expired rows. Used by the cron job. */
  async deleteExpired(): Promise<number> {
    const result = await this.repository.delete({ expiresAt: LessThan(ClDateHelper.getDate()) });
    return result.affected ?? 0;
  }

  private expiryFromNow(): DateTime {
    return ClDateHelper.getDate().plus({ seconds: this.configService.getRefreshTokenDurationInSeconds() });
  }

  private static generateToken(): string {
    return randomBytes(32).toString('hex');
  }

  /** SHA-256 hex, 64 characters — matches the column length. */
  private static hash(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
