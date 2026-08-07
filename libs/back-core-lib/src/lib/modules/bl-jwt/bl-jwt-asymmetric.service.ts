import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

import { BlDecodedToken, BlTokenUser } from './bl-jwt.class';
import { BL_JWT_ASYMMETRIC_ALGORITHM, BlJwks } from './bl-jwt-key.class';
import { BlJwtKeyStore } from './bl-jwt-key.store';

/**
 * Mints and verifies the tokens that deliberately cross an application boundary — MCP
 * access tokens — with a private key, so that verifying one requires only the published
 * public half.
 *
 * Deliberately separate from `BlJwtService`, which stays on the application's own
 * symmetric secret for its own Session tokens. Two services rather than two methods on
 * one, because the split is the security property: a caller cannot reach for the wrong
 * key by passing the wrong argument, and the Resource Server that later verifies without
 * minting needs this class and not that one.
 *
 * Uses `jsonwebtoken` directly rather than `@nestjs/jwt`'s `JwtService`, which is bound
 * at module registration to a single secret and algorithm — here neither is fixed for the
 * lifetime of the process, since the key set can name two keys during a rotation.
 */
@Injectable()
export class BlJwtAsymmetricService {
  constructor(private readonly keyStore: BlJwtKeyStore) {}

  /**
   * Mint an MCP access token bound to one Resource (`aud`).
   *
   * The `kid` header names the key that signed it, so a verifier holding both keys of a
   * rotation picks the right one instead of trying each — and so a token minted before a
   * rotation keeps verifying after it.
   */
  public generateTokenForAudience(
    userId: string,
    userEmail: string,
    audience: string,
    expiresInSeconds: number
  ): string {
    const { privateKey, kid } = this.keyStore.signingKey;
    const payload: BlTokenUser = { sub: userId, email: userEmail };

    return jwt.sign(payload, privateKey, {
      algorithm: BL_JWT_ASYMMETRIC_ALGORITHM,
      keyid: kid,
      audience,
      expiresIn: expiresInSeconds,
    });
  }

  /**
   * Verify signature and expiry, and return the decoded payload. Throws on anything
   * else. Does NOT check the audience — the caller knows which resource it is serving
   * and must compare it itself.
   *
   * Exactly one algorithm is accepted. This is the whole reason this method exists
   * instead of a shared verifier taking a key: a verifier that also accepted the
   * symmetric algorithm could be defeated by signing a token with the *published public
   * key* as the HMAC secret, which anyone can fetch.
   */
  public verifyToken(token: string): BlDecodedToken {
    // Reading the header is not trusting it: it only selects which public key the
    // signature is then checked against, and naming a key we do not publish — or naming
    // none — resolves to nothing rather than to a default.
    const kid = jwt.decode(token, { complete: true })?.header.kid;
    const publicKey = this.keyStore.publicKeyFor(kid);
    if (publicKey == null) {
      throw new jwt.JsonWebTokenError(
        kid == null ? 'token names no signing key' : `token names an unknown signing key '${kid}'`
      );
    }

    return jwt.verify(token, publicKey, {
      algorithms: [BL_JWT_ASYMMETRIC_ALGORITHM],
    }) as BlDecodedToken;
  }

  /** The public key set, for the document served at the `jwks_uri`. */
  public getJwks(): BlJwks {
    return this.keyStore.jwks;
  }
}
