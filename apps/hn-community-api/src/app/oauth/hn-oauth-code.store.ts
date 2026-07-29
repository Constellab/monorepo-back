import { BlRedisStore } from '@monorepo/back-core-lib';
import { Injectable, Logger } from '@nestjs/common';
import { randomBytes } from 'crypto';

export interface HnOAuthCodeUser {
  id: string;
  email: string;
}

/** Everything an authorization code is bound to, checked again at /token. */
export interface HnOAuthCodeBinding {
  clientId: string;
  redirectUri: string;
  codeChallenge: string;
  resource: string;
  user: HnOAuthCodeUser;
}

const KEY_PREFIX = 'oauth:code:';

// OAuth 2.1 recommends an authorization code lifetime of <= 60s.
const TTL_SECONDS = 60;

/**
 * Redis-backed store of authorization codes (OAuth 2.1): short-lived, single-use.
 */
@Injectable()
export class HnOAuthCodeStore {
  private readonly logger = new Logger(HnOAuthCodeStore.name);

  constructor(private readonly redis: BlRedisStore) {}

  async create(binding: HnOAuthCodeBinding): Promise<string> {
    const code = randomBytes(32).toString('hex');
    await this.redis.setWithTtl(`${KEY_PREFIX}${code}`, JSON.stringify(binding), TTL_SECONDS);
    return code;
  }

  /**
   * One-time consume: the code is always removed. Returns null when unknown or
   * expired, which Redis makes indistinguishable — both are `invalid_grant` anyway.
   */
  async consume(code: string): Promise<HnOAuthCodeBinding | null> {
    const raw = await this.redis.getAndDelete(`${KEY_PREFIX}${code}`);
    if (raw == null) {
      return null;
    }
    try {
      return JSON.parse(raw) as HnOAuthCodeBinding;
    } catch {
      // Corrupt entry: treat as absent rather than failing the request.
      this.logger.warn('Discarded an unparsable authorization code entry');
      return null;
    }
  }
}
