import { Request } from 'express';

import { BlUser } from '../../models/bl-user/bl-user.class';

export const BL_JWT_CONFIG_PROVIDER = Symbol();

/**
 * The one algorithm a Session token may be signed with.
 *
 * A Session token never leaves the application that mints it, so it stays on that
 * application's own symmetric secret. Named rather than left to the library default so
 * every path that signs or verifies one can state which single algorithm it accepts: a
 * path accepting both this and {@link BL_JWT_ASYMMETRIC_ALGORITHM} is the
 * algorithm-confusion vulnerability, because the published public key is then usable as
 * an HMAC secret.
 */
export const BL_JWT_SESSION_ALGORITHM = 'HS256';

export interface BlJwtConfig {
  jwtSecret: string;
  jwtFromRequest: (request: Request) => string | undefined;
  usersService: BlUserService;
  tokenDurationInSeconds: number;
}

export interface BlTokenUser {
  sub: string; // user id
  email: string; // user mail
}

/** Decoded JWT payload, including the standard claims we may inspect. */
export interface BlDecodedToken extends BlTokenUser {
  aud?: string | string[];
  exp?: number;
  iat?: number;
}

export abstract class BlUserService {
  public abstract findOne(id: string): Promise<BlUser | null>;
}
