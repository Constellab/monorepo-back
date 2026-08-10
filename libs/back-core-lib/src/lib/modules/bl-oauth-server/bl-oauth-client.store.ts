import { Injectable, Logger } from '@nestjs/common';
import { randomBytes } from 'crypto';

import { BlRedisStore } from '../bl-redis/bl-redis.class';
import { blParseStoredJson } from '../bl-redis/bl-redis-json.util';

export interface BlOAuthClient {
  client_id: string;
  redirect_uris: string[];
  client_name?: string;
}

export interface BlOAuthClientRegistration {
  redirect_uris: string[];
  client_name?: string;
}

const KEY_PREFIX = 'oauth:client:';

/**
 * Registrations are disposable — MCP clients re-register through DCR whenever their
 * client_id is unknown — so they get an expiry rather than living forever. That also
 * bounds how much an unauthenticated caller can accumulate in the store.
 */
const TTL_SECONDS = 30 * 24 * 60 * 60;

/**
 * Longest `client_name` kept.
 *
 * Enforced here rather than at the endpoint because this is what persists the string, for
 * the lifetime of the client, from a public and unauthenticated request. A bound applied by
 * a caller is a bound the next caller can forget.
 */
const MAX_CLIENT_NAME_LENGTH = 200;

/**
 * Redis-backed registry of OAuth clients (RFC 7591 Dynamic Client Registration).
 *
 * Public clients only (PKCE, no secret). Redis rather than a process-local Map so a
 * client_id registered against one replica is resolvable from every other one;
 * otherwise `/authorize` fails with an intermittent `invalid_client`.
 */
@Injectable()
export class BlOAuthClientStore {
  private readonly logger = new Logger(BlOAuthClientStore.name);

  constructor(private readonly redis: BlRedisStore) {}

  async register(registration: BlOAuthClientRegistration): Promise<BlOAuthClient> {
    const client: BlOAuthClient = {
      client_id: randomBytes(16).toString('hex'),
      redirect_uris: registration.redirect_uris,
      client_name: registration.client_name?.slice(0, MAX_CLIENT_NAME_LENGTH),
    };
    await this.redis.setWithTtl(`${KEY_PREFIX}${client.client_id}`, JSON.stringify(client), TTL_SECONDS);
    return client;
  }

  async find(clientId: string): Promise<BlOAuthClient | null> {
    // A corrupt entry reads as unknown; the client simply re-registers.
    return blParseStoredJson<BlOAuthClient>(
      await this.redis.get(`${KEY_PREFIX}${clientId}`),
      this.logger,
      `client entry for '${clientId}'`
    );
  }

  /** Exact-match check against the client's registered redirect URIs (anti open-redirect). */
  redirectUriAllowed(client: BlOAuthClient, redirectUri: string): boolean {
    return client.redirect_uris.includes(redirectUri);
  }
}
