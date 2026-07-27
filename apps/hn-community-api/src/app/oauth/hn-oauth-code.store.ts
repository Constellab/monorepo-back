import { Injectable } from '@nestjs/common';
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

/**
 * In-memory store of authorization codes (OAuth 2.1). Codes are short-lived and
 * single-use. In-memory for v1 (mirrors the cli-auth pattern) — a dedicated
 * instance, NOT shared with the cli-auth device-flow store.
 */
@Injectable()
export class HnOAuthCodeStore {
  // OAuth 2.1 recommends an authorization code lifetime of <= 60s.
  private static readonly TTL_MS = 60_000;

  private readonly codes = new Map<string, { binding: HnOAuthCodeBinding; expiresAt: number }>();

  create(binding: HnOAuthCodeBinding): string {
    const code = randomBytes(32).toString('hex');
    this.codes.set(code, { binding, expiresAt: Date.now() + HnOAuthCodeStore.TTL_MS });
    return code;
  }

  /** One-time consume: the code is always removed; returns null if unknown or expired. */
  consume(code: string): HnOAuthCodeBinding | null {
    const entry = this.codes.get(code);
    if (!entry) {
      return null;
    }
    this.codes.delete(code);
    if (Date.now() > entry.expiresAt) {
      return null;
    }
    return entry.binding;
  }
}
