import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { BL_JWT_SESSION_ALGORITHM, BlDecodedToken, BlTokenUser } from './bl-jwt.class';

/**
 * Mints and verifies the tokens that never leave this application — Session tokens —
 * on its own symmetric secret. MCP access tokens, which deliberately cross an
 * application boundary, belong to `BlJwtAsymmetricService` instead.
 */
@Injectable()
export class BlJwtService {
  constructor(private jwtService: JwtService) {}

  /**
   * Generate a token with the userId and the userEmail.
   *
   * `expiresInSeconds` overrides the module-wide lifetime configured from
   * `BlJwtConfig.tokenDurationInSeconds`. Callers that mint short-lived access
   * tokens pass it; callers that omit it keep the module default.
   */
  public generateToken(userId: string, userEmail: string, expiresInSeconds?: number): string {
    // set the userId and email in the token
    const payload: BlTokenUser = { sub: userId, email: userEmail };
    return this.jwtService.sign(payload, this.signOptions(expiresInSeconds));
  }

  /**
   * Verify a Session token's signature and expiry and return its decoded payload.
   * Throws if the token is invalid or expired. Does NOT check the audience — `aud` has
   * no business being on a Session token at all, and `BlJwtStrategy` is what rejects one
   * that carries it.
   *
   * Pins the algorithm rather than letting the secret imply it: without this, the same
   * secret would also verify a token an attacker signed with the *published public key*
   * as an HMAC secret, which is the one thing publishing keys must not enable.
   */
  public verifyToken(token: string): BlDecodedToken {
    return this.jwtService.verify<BlDecodedToken>(token, {
      algorithms: [BL_JWT_SESSION_ALGORITHM],
    });
  }

  /**
   * Omit `expiresIn` entirely when no override is given, so `@nestjs/jwt` falls
   * back to the module's `signOptions` instead of receiving `undefined`.
   */
  private signOptions(expiresInSeconds?: number): { expiresIn?: number } {
    return expiresInSeconds == null ? {} : { expiresIn: expiresInSeconds };
  }
}
