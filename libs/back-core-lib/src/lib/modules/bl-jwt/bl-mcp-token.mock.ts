import { KeyObject } from 'node:crypto';

import * as jwt from 'jsonwebtoken';

import { BlDecodedToken } from './bl-jwt.class';
import { BlJwtAsymmetricVerifier } from './bl-jwt-asymmetric.verifier';
import { BL_JWT_ASYMMETRIC_ALGORITHM, BlJwks, BlJwtKeySource } from './bl-jwt-key.class';
import { blGenerateTestSigningKey } from './bl-jwt-key.mock';
import { blBuildJwks, blLoadSigningKey, blPublicKeyFromJwk } from './bl-jwt-key.util';

/** The claims an MCP access token carries, as a suite chooses to vary them. */
export interface BlTestMcpTokenClaims {
  /** The user the token acts as. */
  sub?: string;
  email?: string;
  /** The Resource the token is for. Absent mints a token with no audience at all. */
  audience?: string;
  /** Seconds from now. Negative mints an already-expired token. */
  expiresInSeconds?: number;
  /**
   * Signing algorithm, for the suites whose subject is the pin.
   *
   * `HS256` signs with the *published public key* as the HMAC secret — the attack that
   * publishing a key makes possible, and the one a verifier accepting both algorithms
   * falls to. `none` mints an unsigned token.
   */
  algorithm?: 'RS256' | 'HS256' | 'none';
  /** The `kid` claimed in the header. Defaults to the fixture's own key. */
  kid?: string;
}

/**
 * The Authorization Server as the other application sees it: a key set it can publish, and
 * tokens signed under it.
 *
 * The one seam shared by the two e2e suites, and a fixture rather than a harness. Booting
 * both applications together was rejected — it is a new kind of thing to maintain, and the
 * two suites already contend over test databases badly enough to force single-worker runs.
 * What is actually shared between them is the *shape of a token*, so that is what is
 * shared:
 *
 * - the Community suite stubs `BL_JWT_KEY_SOURCE` with {@link keySource} and asserts its
 *   guard accepts exactly what this mints;
 * - the Space API suite asserts a token from its own real flow verifies through
 *   {@link blVerifyLikeResourceServer}, holding nothing but the key set it published.
 *
 * A drift on either side turns one of them red, which is the whole reason this is one file
 * rather than two conventions.
 *
 * Both directions run the *real* `BlJwtAsymmetricVerifier` over the *real* JWK conversion.
 * Nothing here re-implements verification, so neither suite can go on passing against a
 * lookalike of the path it claims to be standing in for.
 */
export class BlTestAuthorizationServer {
  private constructor(
    private readonly privateKeyPem: string,
    private readonly kid: string,
    /** The key set this "Authorization Server" publishes. */
    readonly jwks: BlJwks
  ) {}

  /**
   * A throwaway Authorization Server on a freshly generated key.
   *
   * Per run rather than fixed, so a suite asserts on properties that hold for any key
   * rather than on one blessed key's values.
   */
  static generate(): BlTestAuthorizationServer {
    const { privateKeyPem, privateKeyBase64 } = blGenerateTestSigningKey();
    const keyPair = blLoadSigningKey(privateKeyBase64, 'test');
    return new BlTestAuthorizationServer(privateKeyPem, keyPair.kid, blBuildJwks([keyPair]));
  }

  /** The `kid` of the key this mints under, as the published document names it. */
  get signingKid(): string {
    return this.kid;
  }

  /**
   * The published public key in PEM, as anyone who fetched the key set holds it — used to
   * verify a token by hand, and to attempt the algorithm-confusion attack with.
   */
  get publicKeyPem(): string {
    return blPublicKey(this.jwks).export({ type: 'spki', format: 'pem' }).toString();
  }

  /**
   * Mint an MCP access token as the Authorization Server would.
   *
   * Every field is overridable because the interesting cases in a Resource Server suite
   * are the malformed ones: another audience, another algorithm, another key, expired.
   */
  mintMcpAccessToken(claims: BlTestMcpTokenClaims = {}): string {
    const {
      sub = 'test-user',
      email = 'test-user@example.com',
      audience,
      expiresInSeconds = 3600,
      algorithm = BL_JWT_ASYMMETRIC_ALGORITHM,
      kid = this.kid,
    } = claims;

    const payload: Record<string, unknown> = { sub, email };
    if (audience != null) {
      payload.aud = audience;
    }
    // `exp` is set here rather than through `expiresIn` so a negative value can mint an
    // already-expired token, which `expiresIn` refuses to do.
    payload.exp = Math.floor(Date.now() / 1000) + expiresInSeconds;

    // The published public key as an HMAC secret is the attack, not a mistake: a verifier
    // accepting both algorithms treats a document anyone can fetch as a shared secret.
    const key = algorithm === 'HS256' ? this.publicKeyPem : algorithm === 'none' ? null : this.privateKeyPem;

    return jwt.sign(payload, key as jwt.Secret, { algorithm, keyid: kid });
  }

  /**
   * The published key set as a Resource Server's key source, for substituting into an
   * application under test.
   *
   * Goes through the same JWK-to-key conversion the real remote store uses, so a suite
   * stubs where the document comes from and nothing about how it is read.
   */
  keySource(): BlJwtKeySource {
    return blJwksKeySource(this.jwks);
  }
}

/**
 * Verify a token the way a Resource Server does, holding nothing but a published key set.
 *
 * Used by the Authorization Server's own suite: it asserts the tokens it mints are readable
 * by a verifier holding only the document, which is the contract the Community depends on.
 *
 * Goes through the real `BlJwtAsymmetricVerifier` rather than calling `jsonwebtoken`
 * directly. A local `jwt.verify` here would be a second copy of the algorithm pin — the one
 * thing this module says must exist once — and it would let the Space API suite keep passing
 * against a lookalike after the real verifier changed.
 *
 * Rejects exactly as the verifier does when the token does not hold up.
 */
export function blVerifyLikeResourceServer(token: string, jwks: BlJwks): Promise<BlDecodedToken> {
  return new BlJwtAsymmetricVerifier(blJwksKeySource(jwks)).verifyToken(token);
}

/**
 * A published key set as a key source, resolving a `kid` exactly as the real remote store
 * does — by name, and to nothing when the document names no such key.
 *
 * Selecting by `kid` rather than taking the only key is the point: a Resource Server
 * refuses a token that names no key or an unknown one, so a fixture that quietly used the
 * first key it found would accept tokens the real path rejects, and the suite asserting
 * "this is what the Community will do" would be asserting something softer.
 */
function blJwksKeySource(jwks: BlJwks): BlJwtKeySource {
  return {
    publicKeyFor: (kid: string | undefined): Promise<KeyObject | null> =>
      Promise.resolve(
        kid == null ? null : (jwks.keys.filter((key) => key.kid === kid).map(blPublicKeyFromJwk)[0] ?? null)
      ),
  };
}

/** The single usable key of a key set, as a fixture outside a rotation always has. */
function blPublicKey(jwks: BlJwks): KeyObject {
  const publicKey = jwks.keys.map(blPublicKeyFromJwk).find((key) => key != null);
  if (publicKey == null) {
    throw new Error('the key set names no usable RS256 signing key');
  }
  return publicKey;
}
