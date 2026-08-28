import { KeyObject } from 'node:crypto';

import { Inject, Injectable } from '@nestjs/common';

import {
  BL_JWT_ASYMMETRIC_CONFIG_PROVIDER,
  BlJwks,
  BlJwtAsymmetricConfig,
  BlJwtKeyPair,
  BlJwtKeySource,
} from './bl-jwt-key.class';
import { blBuildJwks, BlJwtKeyError, blLoadSigningKey } from './bl-jwt-key.util';

/** Configuration entry names, quoted verbatim in the error an operator has to act on. */
const CURRENT_KEY_CONFIG_NAME = 'privateKeyBase64';
const PREVIOUS_KEY_CONFIG_NAME = 'previousPrivateKeyBase64';

/**
 * The keys this application signs MCP access tokens with and publishes for verification.
 *
 * Loaded eagerly in the constructor, so a missing or malformed key throws while Nest is
 * building the injector and the process never starts. Loading lazily would turn the same
 * misconfiguration into every token being rejected at runtime, which looks like a client
 * problem and is the failure mode this is written to avoid.
 *
 * Holds at most two keys: the one that signs, and optionally the one being rotated out,
 * which is published and accepted but never signs again.
 *
 * The key source of the application that mints (`BlJwtRemoteKeyStore` is the other one):
 * it verifies against the private keys it holds rather than against its own published
 * document, so verifying does not depend on its own HTTP surface being reachable.
 */
@Injectable()
export class BlJwtKeyStore implements BlJwtKeySource {
  private readonly current: BlJwtKeyPair;

  /** Current first — the order the key set is published in. */
  private readonly published: BlJwtKeyPair[];

  /**
   * Built once, here, rather than on each request: the keys cannot change without a
   * restart, and every `kid` in it is a SHA-256 over the key. Rebuilding it per request
   * would put that hashing on a public, unauthenticated endpoint.
   */
  private readonly publishedJwks: BlJwks;

  constructor(@Inject(BL_JWT_ASYMMETRIC_CONFIG_PROVIDER) config: BlJwtAsymmetricConfig) {
    this.current = blLoadSigningKey(config.privateKeyBase64, CURRENT_KEY_CONFIG_NAME);

    const previous =
      config.previousPrivateKeyBase64 != null && config.previousPrivateKeyBase64.trim().length > 0
        ? blLoadSigningKey(config.previousPrivateKeyBase64, PREVIOUS_KEY_CONFIG_NAME)
        : null;

    if (previous != null && previous.kid === this.current.kid) {
      // Not merely redundant: it means someone believes a rotation is in progress when
      // the old key was never replaced, so retiring the "previous" one later will
      // invalidate every live token at once.
      throw new BlJwtKeyError(PREVIOUS_KEY_CONFIG_NAME, 'holds the same key as the current one');
    }

    this.published = previous == null ? [this.current] : [this.current, previous];
    this.publishedJwks = blBuildJwks(this.published);
  }

  /** The key new tokens are signed with. Never the previous one. */
  get signingKey(): BlJwtKeyPair {
    return this.current;
  }

  /**
   * The public key a token names, or null if it names none we publish.
   *
   * A token with no `kid` resolves to nothing rather than falling back to the current
   * key: every token this application mints carries one, so an absent `kid` is either a
   * token from somewhere else or one built by hand.
   *
   * Returns a promise only to satisfy {@link BlJwtKeySource}, whose other implementation
   * fetches. Deliberately not `async`: nothing here waits on anything, and the keys are
   * in memory before the first request arrives.
   */
  publicKeyFor(kid: string | undefined): Promise<KeyObject | null> {
    const publicKey =
      kid == null ? null : (this.published.find((keyPair) => keyPair.kid === kid)?.publicKey ?? null);
    return Promise.resolve(publicKey);
  }

  /** The published key set, current key first. */
  get jwks(): BlJwks {
    return this.publishedJwks;
  }
}
