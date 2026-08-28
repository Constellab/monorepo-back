import { KeyObject } from 'node:crypto';

import { Inject, Injectable, Logger } from '@nestjs/common';

import { BL_OAUTH_PATHS } from '../bl-oauth/bl-oauth.constants';
import { blStripTrailingSlashes } from '../bl-oauth/bl-oauth-url.util';
import {
  BL_JWT_REMOTE_KEY_CONFIG_PROVIDER,
  BlJwk,
  BlJwtKeySource,
  BlJwtRemoteKeyConfig,
} from './bl-jwt-key.class';
import { blPublicKeyFromJwk } from './bl-jwt-key.util';

/** How long a fetch of the key set may take before the request is refused instead. */
const FETCH_TIMEOUT_MS = 5_000;

/**
 * Shortest interval between two fetches prompted by an unrecognized `kid`.
 *
 * Refetching at all is what makes "a rotation is two deployments rather than a flag day"
 * true on this side of the boundary. The Authorization Server publishing a current and a
 * previous key buys nothing here if a Resource Server only ever reads that document once:
 * the moment the new key starts signing, every token names a `kid` this cache does not
 * hold, and the Community would refuse all of them until someone redeployed it. That is a
 * flag day again, just moved.
 *
 * The cooldown is what keeps that from being exploitable. Without it, a caller presenting
 * garbage `kid`s turns an unauthenticated endpoint into one outbound request per call
 * against the Authorization Server. With it, the cost is bounded whatever the traffic, and
 * a genuine rotation still becomes visible within a minute.
 */
const REFETCH_COOLDOWN_MS = 60_000;

/**
 * The public keys of the Authorization Server, as a Resource Server holds them: fetched
 * from the key set it publishes, cached, and never anything but public.
 *
 * The counterpart of `BlJwtKeyStore` on the verifying side. Nothing here can produce a
 * private key, which is the property ADR-0001 is about: compromising a Resource Server
 * yields the ability to check signatures and not to make them.
 *
 * Fetched lazily rather than at startup, deliberately. A Resource Server that fetched
 * while Nest built its injector would fail to boot whenever the Authorization Server were
 * down or merely slower to start — turning a dependency that matters only for MCP calls
 * into one that gates browser login and every other route. The cost is that the first MCP
 * call after a restart pays the round trip.
 *
 * Uses `fetch` rather than `BlExternalApiService`: one unauthenticated GET of a public
 * document, and `bl-jwt` taking a dependency on the axios-and-RxJS wrapper for it would
 * be the larger cost.
 */
@Injectable()
export class BlJwtRemoteKeyStore implements BlJwtKeySource {
  private readonly logger = new Logger(BlJwtRemoteKeyStore.name);

  /** Public keys by the `kid` they were published under. Empty until the first fetch. */
  private keys = new Map<string, KeyObject>();

  /**
   * The fetch in flight, so concurrent callers share one request rather than each
   * opening their own — a burst of MCP calls after a restart is the normal case here.
   */
  private inFlight: Promise<void> | null = null;

  /** When the last fetch finished, successfully or not. Zero until one has. */
  private lastFetchAt = 0;

  constructor(@Inject(BL_JWT_REMOTE_KEY_CONFIG_PROVIDER) private readonly config: BlJwtRemoteKeyConfig) {}

  /**
   * Where the key set is fetched from.
   *
   * Derived from the Authorization Server's base URL and `BL_OAUTH_PATHS.jwks` — the same
   * constant the publishing route is mounted on — rather than configured, so the URL
   * fetched and the URL served cannot be configured apart.
   */
  get jwksUrl(): string {
    return `${blStripTrailingSlashes(this.config.authorizationServerUrl)}/${BL_OAUTH_PATHS.jwks}`;
  }

  /**
   * The public key a token names, or null when the Authorization Server publishes none
   * under that `kid`.
   *
   * An unknown `kid` triggers at most one refetch, subject to {@link REFETCH_COOLDOWN_MS}:
   * that is what makes a key rotation on the Authorization Server visible here without a
   * redeployment, and the cooldown is what keeps a caller sending unknown `kid`s from
   * driving traffic at it.
   *
   * A `kid`-less token resolves to nothing rather than to whatever single key happens to
   * be published: every token this platform mints names its key, so a token without one
   * came from somewhere else.
   */
  async publicKeyFor(kid: string | undefined): Promise<KeyObject | null> {
    if (kid == null) {
      return null;
    }

    const cached = this.keys.get(kid);
    if (cached != null) {
      return cached;
    }

    // The cooldown applies to a failed fetch exactly as it does to a successful one:
    // otherwise an Authorization Server that is down turns every call at this
    // unauthenticated endpoint into an outbound request at it, which is the worst moment
    // to be adding load.
    if (this.lastFetchAt === 0 || Date.now() - this.lastFetchAt >= REFETCH_COOLDOWN_MS) {
      await this.refresh();
    }

    return this.keys.get(kid) ?? null;
  }

  /**
   * Fetch the key set and replace what is cached, keeping the previous keys on failure.
   *
   * Replacing rather than merging: the published document is the whole truth about which
   * keys verify, so a key retired there stops verifying here at the next fetch. Merging
   * would keep a retired key alive until the process restarted, which is the opposite of
   * what retiring one is for.
   *
   * A failed fetch is logged and swallowed. The caller's token then fails to resolve a
   * key and the request is refused — a Resource Server that cannot reach the key set
   * refuses rather than accepts, and it keeps serving everything that is not an MCP call.
   */
  private async refresh(): Promise<void> {
    // Joining the in-flight request rather than starting a second one; the flag is
    // cleared by whoever started it.
    if (this.inFlight != null) {
      return this.inFlight;
    }

    this.inFlight = this.fetchKeys()
      .then((keys) => {
        this.keys = keys;
      })
      .catch((error: unknown) => {
        this.logger.error(
          `Could not fetch the signing keys from ${this.jwksUrl}: ${(error as Error).message}. ` +
            'MCP access tokens naming an unknown key will be refused.'
        );
      })
      .finally(() => {
        this.lastFetchAt = Date.now();
        this.inFlight = null;
      });

    return this.inFlight;
  }

  /** One GET of the published document, turned into the keys it names. */
  private async fetchKeys(): Promise<Map<string, KeyObject>> {
    const response = await fetch(this.jwksUrl, {
      headers: { accept: 'application/json' },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!response.ok) {
      throw new Error(`responded ${response.status}`);
    }

    const document = (await response.json()) as { keys?: BlJwk[] };
    const keys = new Map<string, KeyObject>();
    for (const jwk of document?.keys ?? []) {
      const publicKey = blPublicKeyFromJwk(jwk);
      if (publicKey != null) {
        keys.set(jwk.kid, publicKey);
      }
    }

    if (keys.size === 0) {
      // Kept apart from a network failure on purpose: this one means the document was
      // served and holds nothing we can verify with, which is a misconfiguration on the
      // Authorization Server rather than a blip.
      throw new Error('the document names no usable RS256 signing key');
    }
    return keys;
  }
}
