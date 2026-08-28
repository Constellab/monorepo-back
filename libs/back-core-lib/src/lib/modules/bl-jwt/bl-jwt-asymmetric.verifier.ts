import { Inject, Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

import { BlDecodedToken } from './bl-jwt.class';
import { BL_JWT_ASYMMETRIC_ALGORITHM, BL_JWT_KEY_SOURCE, BlJwtKeySource } from './bl-jwt-key.class';

/**
 * Verifies MCP access tokens, and does nothing else — in particular it cannot mint one.
 *
 * This is what a Resource Server holds. Where the public keys come from is the injected
 * {@link BlJwtKeySource}: the application that signs resolves a `kid` against its own
 * configured keys, a Resource Server resolves it against the key set the Authorization
 * Server publishes. Everything below is identical either way, which is why it is here and
 * not duplicated on both sides — the algorithm pin especially, since a second copy is the
 * one nobody re-reads.
 */
@Injectable()
export class BlJwtAsymmetricVerifier {
  constructor(@Inject(BL_JWT_KEY_SOURCE) private readonly keySource: BlJwtKeySource) {}

  /**
   * Verify signature and expiry, and return the decoded payload. Throws on anything
   * else. Does NOT check the audience — the caller knows which resource it is serving
   * and must compare it itself.
   *
   * Exactly one algorithm is accepted. This is the whole reason this class exists instead
   * of a shared verifier taking a key: a verifier that also accepted the symmetric
   * algorithm could be defeated by signing a token with the *published public key* as the
   * HMAC secret, which anyone can fetch — and publishing that key is precisely what makes
   * a Resource Server in another application possible.
   */
  public async verifyToken(token: string): Promise<BlDecodedToken> {
    // Reading the header is not trusting it: it only selects which public key the
    // signature is then checked against, and naming a key we do not hold — or naming
    // none — resolves to nothing rather than to a default.
    const kid = jwt.decode(token, { complete: true })?.header.kid;
    const publicKey = await this.keySource.publicKeyFor(kid);
    if (publicKey == null) {
      throw new jwt.JsonWebTokenError(
        kid == null ? 'token names no signing key' : `token names an unknown signing key '${kid}'`
      );
    }

    return jwt.verify(token, publicKey, {
      algorithms: [BL_JWT_ASYMMETRIC_ALGORITHM],
    }) as BlDecodedToken;
  }
}
