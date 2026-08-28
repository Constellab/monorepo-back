import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

import { BlTokenUser } from './bl-jwt.class';
import { BL_JWT_ASYMMETRIC_ALGORITHM, BlJwks } from './bl-jwt-key.class';
import { BlJwtKeyStore } from './bl-jwt-key.store';

/**
 * Mints the tokens that deliberately cross an application boundary — MCP access tokens —
 * with a private key, so that verifying one requires only the published public half.
 *
 * Deliberately separate from `BlJwtService`, which stays on the application's own
 * symmetric secret for its own Session tokens. Two services rather than two methods on
 * one, because the split is the security property: a caller cannot reach for the wrong
 * key by passing the wrong argument.
 *
 * Verification is `BlJwtAsymmetricVerifier`'s, not this class's, and that split is the
 * same property one level out: a Resource Server mounts the verifier and never this — so
 * "holds no ability to mint" is something the injector enforces rather than something the
 * code is trusted not to do.
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

  /** The public key set, for the document served at the `jwks_uri`. */
  public getJwks(): BlJwks {
    return this.keyStore.jwks;
  }
}
