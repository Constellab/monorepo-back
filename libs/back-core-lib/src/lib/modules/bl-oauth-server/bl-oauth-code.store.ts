import { Injectable, Logger } from '@nestjs/common';
import { randomBytes } from 'crypto';

import { BlRedisStore } from '../bl-redis/bl-redis.class';
import { blParseStoredJson } from '../bl-redis/bl-redis-json.util';
import { BlOAuthUser } from './bl-oauth-server.class';

/** Everything an authorization code is bound to, checked again at /token. */
export interface BlOAuthCodeBinding {
  clientId: string;
  redirectUri: string;
  codeChallenge: string;
  /**
   * The Resources the user approved in the pass this code came out of.
   *
   * A list, while the token minted from it names exactly one: the code carries what was
   * approved, and `/token` picks one of those and no others. That is what keeps "several
   * Resources, one prompt" from becoming "one token for several audiences".
   */
  resources: string[];
  user: BlOAuthUser;
}

const KEY_PREFIX = 'oauth:code:';

// OAuth 2.1 recommends an authorization code lifetime of <= 60s.
const TTL_SECONDS = 60;

/**
 * Redis-backed store of authorization codes (OAuth 2.1): short-lived, single-use.
 */
@Injectable()
export class BlOAuthCodeStore {
  private readonly logger = new Logger(BlOAuthCodeStore.name);

  constructor(private readonly redis: BlRedisStore) {}

  async create(binding: BlOAuthCodeBinding): Promise<string> {
    const code = randomBytes(32).toString('hex');
    await this.redis.setWithTtl(`${KEY_PREFIX}${code}`, JSON.stringify(binding), TTL_SECONDS);
    return code;
  }

  /**
   * One-time consume: the code is always removed. Returns null when unknown or
   * expired, which Redis makes indistinguishable — both are `invalid_grant` anyway.
   */
  async consume(code: string): Promise<BlOAuthCodeBinding | null> {
    // A corrupt entry reads as absent rather than failing the request — both are
    // `invalid_grant` to the client either way.
    return blParseStoredJson<BlOAuthCodeBinding>(
      await this.redis.getAndDelete(`${KEY_PREFIX}${code}`),
      this.logger,
      'authorization code entry'
    );
  }
}
