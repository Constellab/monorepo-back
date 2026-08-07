import { applyDecorators, ExecutionContext, SetMetadata, UseGuards } from '@nestjs/common';
import { CustomDecorator } from '@nestjs/common/decorators/core/set-metadata.decorator';
import { Reflector } from '@nestjs/core';
import { Throttle } from '@nestjs/throttler';

import { BlThrottlerBehindProxyGuard } from '../guards/bl-throttler-behind-proxy.guard';
import { BlReflectorHelper } from '../utils/bl-reflector.helper';

const publicMetadata = 'isPublic';
const optionalAuthMetadata = 'isOptionalAuth';

/**
 * @Public decorator for method or class to make a route public so the guard
 * don't check the existence of the token
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const BlPublic = (): CustomDecorator => SetMetadata(publicMetadata, true);

/**
 * @OptionalAuth decorator for a route that serves both anonymous and authenticated
 * callers, and whose **response depends on which one it is** — a brick list, a story,
 * anything filtered by the current user.
 *
 * `@BlPublic` is not enough for these: it makes "no token" and "expired token"
 * indistinguishable, so a caller whose access token has just expired silently gets the
 * anonymous answer with a 200. Their session is still valid — the refresh token lives
 * far longer — but nothing ever tells them to renew it, and they lose the private half
 * of their results without any error.
 *
 * A route marked here still answers 200 anonymously when no token is presented. It
 * answers 401 when a token IS presented but rejected — and only to a caller that
 * declared it can act on it, see `blRequestIsRefreshCapable`.
 *
 * Implies `@BlPublic`: anonymous access is allowed, so anything else reading the public
 * metadata keeps seeing what it expects.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const BlOptionalAuth = (): any =>
  applyDecorators(SetMetadata(publicMetadata, true), SetMetadata(optionalAuthMetadata, true));

/**
 * @PublicSecure decorator for method or class to make a route public so the guard
 * don't check the existence of the token.
 * It also adds a BlThrottlerBehindProxyGuard to prevent brute force attack
 * @constructor
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const BlPublicSecure = (options?: { limit: number; ttl: number }): any => {
  const decorators = [SetMetadata(publicMetadata, true), UseGuards(BlThrottlerBehindProxyGuard)];
  if (options) {
    // The key MUST match a throttler declared in `ThrottlerModule.forRoot`. Both apps
    // declare a single unnamed one, which @nestjs/throttler names 'default' — an
    // unmatched key silently leaves the route on the global limit instead of overriding it.
    // `ttl` is in MILLISECONDS (since throttler v5).
    decorators.push(
      Throttle({
        default: {
          limit: options.limit,
          ttl: options.ttl,
        },
      })
    );
  }
  return applyDecorators(...decorators);
};

/**
 * return true if the method or class is decorated with @Public
 */
export function blIsDecoratedWithPublic(reflector: Reflector, context: ExecutionContext): boolean {
  // Check if the route is annotated with @Public
  return BlReflectorHelper.getClassOrMethodMetadata(reflector, context, publicMetadata);
}

/**
 * return true if the method or class is decorated with @OptionalAuth
 */
export function blIsDecoratedWithOptionalAuth(reflector: Reflector, context: ExecutionContext): boolean {
  return BlReflectorHelper.getClassOrMethodMetadata(reflector, context, optionalAuthMetadata);
}

/**
 * Header a client sets to say "I can renew my token and replay this request".
 *
 * Only the app's own HTTP layer sets it. A server-side renderer, an `<img>` tag, a
 * download link or a crawler cannot act on a 401 — they never send it, so they keep
 * getting the anonymous response instead of a broken page.
 */
export const BL_REFRESH_CAPABLE_HEADER = 'x-auth-refreshable';

/**
 * Whether the caller declared it can renew its token — see {@link BL_REFRESH_CAPABLE_HEADER}.
 *
 * Unauthenticated and forgeable, deliberately harmless: it only ever makes the response
 * *stricter*. Forging it can turn one's own 200 into a 401 and nothing else, so it is
 * never an authorization input.
 */
export function blRequestIsRefreshCapable(headers: Record<string, unknown>): boolean {
  return headers[BL_REFRESH_CAPABLE_HEADER] != null;
}
