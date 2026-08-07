import {
  BlCookieHelper,
  BlJwtService,
  BlOAuthCurrentUserResolver,
  BlOAuthUser,
} from '@monorepo/back-core-lib';
import { Injectable } from '@nestjs/common';
import { Request } from 'express';

import { HN_JWT_CONFIG } from '../auth/hn-jwt.config';

/**
 * Who is logged in, as the Authorization Server's `/authorize` endpoint asks it.
 *
 * The only piece of the OAuth flow this application still holds, and the reason it is a seam
 * at all: a Session token is this application's own credential, minted on its own secret
 * under its own cookie name, so nothing in the library can turn one into a user.
 *
 * It goes through the symmetric verifier — a browser cookie has nothing to do with the key
 * that signs MCP access tokens, and each verification path accepts exactly one algorithm.
 */
@Injectable()
export class HnOAuthCurrentUserResolver implements BlOAuthCurrentUserResolver {
  constructor(private readonly jwtService: BlJwtService) {}

  resolveCurrentUser(request: Request): BlOAuthUser | null {
    const token = BlCookieHelper.getCookieFromHeader(
      request.headers.cookie ?? '',
      HN_JWT_CONFIG.authorizationCookie
    );
    if (!token) {
      return null;
    }
    try {
      const payload = this.jwtService.verifyToken(token);
      return { id: payload.sub, email: payload.email };
    } catch {
      // An expired or rejected Session token is the same answer as none at all: the user
      // has to log in again either way, and `/authorize` will send them to do it.
      return null;
    }
  }
}
