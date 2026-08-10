import { KeyObject } from 'node:crypto';

/**
 * The one algorithm an MCP access token may be signed with. Its symmetric counterpart is
 * {@link BL_JWT_SESSION_ALGORITHM}, in `bl-jwt.class.ts` alongside the secret it goes with.
 *
 * RS256 rather than ES256: the key set is published for other applications to verify
 * through, and RSA is what every JWT library reads without configuration.
 */
export const BL_JWT_ASYMMETRIC_ALGORITHM = 'RS256';

export const BL_JWT_ASYMMETRIC_CONFIG_PROVIDER = Symbol();

/**
 * Key material for the asymmetric signing path, supplied as configuration.
 *
 * Base64-encoded rather than raw PEM because PEM is multi-line and environment
 * variables reliably lose the newlines.
 */
export interface BlJwtAsymmetricConfig {
  /** Base64-encoded PEM private key that signs new tokens. */
  privateKeyBase64: string;

  /**
   * Base64-encoded PEM private key of the key being rotated out.
   *
   * Published alongside the current one and accepted on verification, so a rotation is
   * two deployments — publish the new key, then stop accepting the old one — rather
   * than a flag day that invalidates every live token at once. Absent outside a
   * rotation.
   *
   * A private key, though only the public half is ever used from it: this config belongs
   * to the application that *signs*, which held both halves of the retired key anyway,
   * and one shape for both slots means an operator promoting a key moves a value between
   * two variables rather than converting it. A Resource Server that verifies without
   * minting does not use this at all — it reads the published key set, which is the whole
   * point of publishing it.
   */
  previousPrivateKeyBase64?: string;
}

/**
 * One RSA public key in JWK form (RFC 7517), as published in the key set.
 *
 * Only the public half is ever representable here: a Resource Server reading this
 * document must come away able to verify a token and unable to mint one.
 */
export interface BlJwk {
  kty: 'RSA';
  use: 'sig';
  alg: typeof BL_JWT_ASYMMETRIC_ALGORITHM;
  kid: string;
  /** Modulus, base64url. */
  n: string;
  /** Public exponent, base64url. */
  e: string;
}

/** JWK Set document (RFC 7517 §5), served at the `jwks_uri`. */
export interface BlJwks {
  keys: BlJwk[];
}

/**
 * A loaded signing key, identified by a `kid` derived from the key itself.
 *
 * The `kid` is a thumbprint (RFC 7638) rather than an operator-chosen label, so it
 * cannot be configured wrong: two deployments handed the same key always agree on its
 * identifier, and a key swapped without renaming still changes it.
 */
export interface BlJwtKeyPair {
  kid: string;
  privateKey: KeyObject;
  publicKey: KeyObject;
}

export const BL_JWT_KEY_SOURCE = Symbol('BL_JWT_KEY_SOURCE');

/**
 * Where a verifier gets the public keys it checks MCP access token signatures against.
 *
 * The one seam between minting and verifying, and the reason it exists: the application
 * that signs resolves a `kid` against its own configured private keys, while a Resource
 * Server resolves the same `kid` against the key set the Authorization Server publishes.
 * The verification itself — which algorithm is accepted, what an unknown `kid` means — is
 * identical either way and must stay in one place, so only this differs.
 *
 * Public keys only, in both directions. A source that could hand back a private key would
 * be handing a Resource Server the ability to mint what it accepts, which is exactly what
 * ADR-0001 exists to prevent.
 *
 * Asynchronous because one implementation fetches over the network. The local one answers
 * from memory and simply resolves immediately.
 */
export interface BlJwtKeySource {
  /** The public key a token names, or null if it names none this source knows. */
  publicKeyFor(kid: string | undefined): Promise<KeyObject | null>;
}

export const BL_JWT_REMOTE_KEY_CONFIG_PROVIDER = Symbol('BL_JWT_REMOTE_KEY_CONFIG');

/**
 * What a Resource Server needs in order to verify tokens it cannot mint.
 *
 * One value: where the Authorization Server is. The key set path is not configurable —
 * it is derived from `BL_OAUTH_PATHS.jwks`, the same constant the publishing route is
 * mounted on, so the URL fetched and the URL served agree by construction rather than by
 * two deployments being configured consistently.
 */
export interface BlJwtRemoteKeyConfig {
  /**
   * Base URL of the Authorization Server whose published key set is fetched, no trailing
   * slash required.
   *
   * The same value the Resource Server names in its discovery documents: a client is sent
   * there for a token, and the tokens it comes back with are verified against the keys
   * published there. Naming a different host in the two places is how a Resource Server
   * ends up refusing every token it was told to expect.
   */
  authorizationServerUrl: string;
}
