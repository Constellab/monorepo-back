import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { BlDecodedToken, BlTokenUser } from './bl-jwt.class';

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
   * Generate a token bound to a specific audience (`aud`). Used to mint access
   * tokens scoped to a single resource (e.g. an MCP server) so they can't be
   * mixed up with plain session tokens.
   */
  public generateTokenForAudience(
    userId: string,
    userEmail: string,
    audience: string,
    expiresInSeconds?: number
  ): string {
    const payload: BlTokenUser = { sub: userId, email: userEmail };
    return this.jwtService.sign(payload, { audience, ...this.signOptions(expiresInSeconds) });
  }

  /**
   * Verify a token's signature and expiry and return its decoded payload.
   * Throws if the token is invalid or expired. Does NOT check the audience —
   * callers that require a specific `aud` must check it themselves.
   */
  public verifyToken(token: string): BlDecodedToken {
    return this.jwtService.verify<BlDecodedToken>(token);
  }

  /**
   * Omit `expiresIn` entirely when no override is given, so `@nestjs/jwt` falls
   * back to the module's `signOptions` instead of receiving `undefined`.
   */
  private signOptions(expiresInSeconds?: number): { expiresIn?: number } {
    return expiresInSeconds == null ? {} : { expiresIn: expiresInSeconds };
  }
}
