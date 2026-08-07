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
