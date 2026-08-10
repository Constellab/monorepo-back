import { Injectable, Logger } from '@nestjs/common';
import { randomBytes } from 'crypto';

import { BlRedisStore } from '../bl-redis/bl-redis.class';
import { BlOAuthUser } from './bl-oauth-server.class';

/**
 * An authorization request that has been validated and is waiting for the user to answer.
 *
 * Everything `/authorize` established is kept here and nothing is re-read from the browser
 * afterwards: the consent page and the decision it posts carry a consent id and nothing
 * else, so a page on another origin cannot substitute its own client, redirect target or
 * Resource list into a decision the user believes they are making about something else.
 */
export interface BlOAuthPendingAuthorization {
  clientId: string;
  redirectUri: string;
  codeChallenge: string;
  /** Every Resource asked for in this one pass. Approved together, one Grant each. */
  resources: string[];
  state?: string;
  /**
   * The user `/authorize` resolved from the session.
   *
   * Stored, and compared against the session on every later call, so a pending
   * authorization started under one account cannot be answered by another — a shared
   * browser is the ordinary way that happens.
   */
  user: BlOAuthUser;
}

/** What a minted decision token authorizes: one decision, on one pending authorization. */
export interface BlOAuthConsentDecisionBinding {
  consentId: string;
  userId: string;
}

const PENDING_KEY_PREFIX = 'oauth:consent:';
const DECISION_TOKEN_KEY_PREFIX = 'oauth:consent-token:';

/**
 * How long the user has to answer.
 *
 * Longer than an authorization code's lifetime because a human is in the loop, and long
 * enough to survive a full login round trip: a session that expires under the consent page
 * sends the user through the login page and back, and a pending authorization that died in
 * the meantime abandons a client that is still waiting.
 */
const PENDING_TTL_SECONDS = 10 * 60;

/**
 * How long a minted decision token stays usable.
 *
 * Short because it is minted on the click, not on page load: the only interval it has to
 * cover is the one between the browser receiving it and the browser leaving for the
 * decision endpoint.
 */
const DECISION_TOKEN_TTL_SECONDS = 2 * 60;

/**
 * Redis-backed store of the consent step: the authorization requests waiting for an answer,
 * and the single-use tokens that make an answer unforgeable.
 *
 * Both are short-lived and belong to one pass through the screen, which is why they live
 * here rather than in the database next to the Grants they may produce: nothing in here
 * outlives the user's decision, and everything in here is worthless once it is made.
 *
 * Redis rather than a process-local map for the same reason the client and code stores are:
 * the consent page is a separate request from the `/authorize` that created the pending
 * authorization, and it may well reach another replica.
 */
@Injectable()
export class BlOAuthConsentStore {
  private readonly logger = new Logger(BlOAuthConsentStore.name);

  constructor(private readonly redis: BlRedisStore) {}

  /** Park a validated authorization request and return the id the consent page is given. */
  async createPending(pending: BlOAuthPendingAuthorization): Promise<string> {
    const consentId = randomBytes(32).toString('hex');
    await this.redis.setWithTtl(
      `${PENDING_KEY_PREFIX}${consentId}`,
      JSON.stringify(pending),
      PENDING_TTL_SECONDS
    );
    return consentId;
  }

  /**
   * Read a pending authorization without consuming it.
   *
   * Used by everything that only *describes* the request — the consent page's own load, and
   * the login round trip that re-enters the flow. Reading grants nothing, which is what
   * makes abandoning the page safe: the record simply expires.
   */
  async findPending(consentId: string): Promise<BlOAuthPendingAuthorization | null> {
    return this.parsePending(await this.redis.get(`${PENDING_KEY_PREFIX}${consentId}`));
  }

  /**
   * Take a pending authorization, so it can be decided exactly once.
   *
   * Consumed before the decision is acted on, not after: a refusal must be as final as an
   * approval, and a second navigation to the decision endpoint — a reload, a back button,
   * a replayed history entry — must not produce a second authorization code.
   */
  async consumePending(consentId: string): Promise<BlOAuthPendingAuthorization | null> {
    return this.parsePending(await this.redis.getAndDelete(`${PENDING_KEY_PREFIX}${consentId}`));
  }

  /**
   * Mint the token that lets one decision be posted.
   *
   * This is the cross-site defence of the consent step. Without it, a page on another
   * origin could point a logged-in visitor's browser at the decision endpoint for a
   * pending authorization it started itself, with its own redirect target, and the visitor
   * would approve an account takeover by loading a page. The token is obtainable only by an
   * XHR the CORS policy allows, so only the real consent page can hold one.
   */
  async issueDecisionToken(binding: BlOAuthConsentDecisionBinding): Promise<string> {
    const token = randomBytes(32).toString('hex');
    await this.redis.setWithTtl(
      `${DECISION_TOKEN_KEY_PREFIX}${token}`,
      JSON.stringify(binding),
      DECISION_TOKEN_TTL_SECONDS
    );
    return token;
  }

  /**
   * Spend a decision token. Null when it is unknown, expired or already spent — all of
   * which mean the same thing to the caller: this decision does not count.
   */
  async consumeDecisionToken(token: string): Promise<BlOAuthConsentDecisionBinding | null> {
    const raw = await this.redis.getAndDelete(`${DECISION_TOKEN_KEY_PREFIX}${token}`);
    if (raw == null) {
      return null;
    }
    try {
      return JSON.parse(raw) as BlOAuthConsentDecisionBinding;
    } catch {
      this.logger.warn('Discarded an unparsable consent decision token');
      return null;
    }
  }

  private parsePending(raw: string | null): BlOAuthPendingAuthorization | null {
    if (raw == null) {
      return null;
    }
    try {
      return JSON.parse(raw) as BlOAuthPendingAuthorization;
    } catch {
      // Corrupt entry: treat as absent. The client re-runs the flow, which is the same
      // recovery an expired one gets.
      this.logger.warn('Discarded an unparsable pending authorization entry');
      return null;
    }
  }
}
