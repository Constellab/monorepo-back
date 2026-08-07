import {
  blIsDecoratedWithOptionalAuth,
  blIsDecoratedWithPublic,
  BlRequestContext,
  blRequestIsRefreshCapable,
  BlUnauthorizedException,
} from '@monorepo/back-core-lib';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

import { hnExtractJwtFromRequest } from '../../auth/hn-jwt.config';
import { HnErrorText } from '../model/config/hn-error-text.class';
import { HnCurrentUserHelper, HnRequest } from '../utils/hn-current-user.helper';

/**
 * Guard to check if the user has a authentication token
 * Methods and classes annotated with @Public decorator
 * don't need to check if authentication token exists
 *
 * Methods and classes annotated with @OptionalAuth also allow anonymous access, but
 * refuse a token that was presented and rejected — see {@link allowsAnonymous}
 *
 * Others uses JWT authentication with {@link BlJwtStrategy}
 */
@Injectable()
export class HnJwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // jwt authentication.
    //
    // The try wraps the passport call and nothing else, on purpose: `allowsAnonymous`
    // raises its own 401 and that one must not be swallowed back into an anonymous 200.
    let authenticated: boolean;
    try {
      authenticated = await (super.canActivate(context) as Promise<boolean>);
    } catch {
      // Check if the route allows anonymous callers
      // if yes, authorize
      if (this.allowsAnonymous(context)) {
        return true;
      }
      throw new BlUnauthorizedException(HnErrorText.WRONG_TOKEN);
    }

    if (authenticated) {
      const requestContext = BlRequestContext.currentContext;
      if (requestContext == null) {
        return false;
      }
      const request = requestContext.req as HnRequest;

      // the user is available in the request from super.canActivate
      const user = request.user;
      if (user == null) {
        return false;
      }

      HnCurrentUserHelper.setAuthContext({
        type: 'user',
        user: user,
      });
      return true;
    }

    // Check if the route allows anonymous callers
    // if yes, authorize
    return this.allowsAnonymous(context);
  }

  /**
   * Whether a caller the JWT strategy did not authenticate may still be served.
   *
   * True for `@BlPublic`, unconditionally. True for `@BlOptionalAuth` as well — except
   * in one case: a token WAS presented, it was rejected, and the caller declared it can
   * renew one. That caller gets a 401 so it refreshes and replays, instead of a 200 that
   * silently hides half its results behind an expired session.
   *
   * The refresh-capability check is what keeps this safe to apply broadly. Callers that
   * cannot act on a 401 — the server-side renderer forwarding the browser's stale
   * cookie, an `<img>`, a crawler — do not send the header, so they keep the anonymous
   * response rather than a broken page.
   */
  private allowsAnonymous(context: ExecutionContext): boolean {
    if (!blIsDecoratedWithPublic(this.reflector, context)) {
      return false;
    }

    if (!blIsDecoratedWithOptionalAuth(this.reflector, context)) {
      return true;
    }

    const request = context.switchToHttp().getRequest<HnRequest>();
    const tokenWasPresented = hnExtractJwtFromRequest(request) != null;
    if (tokenWasPresented && blRequestIsRefreshCapable(request.headers)) {
      throw new BlUnauthorizedException(HnErrorText.WRONG_TOKEN);
    }

    return true;
  }
}
