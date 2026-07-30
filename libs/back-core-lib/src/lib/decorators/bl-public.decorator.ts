import { applyDecorators, ExecutionContext, SetMetadata, UseGuards } from '@nestjs/common';
import { CustomDecorator } from '@nestjs/common/decorators/core/set-metadata.decorator';
import { Reflector } from '@nestjs/core';
import { Throttle } from '@nestjs/throttler';

import { BlThrottlerBehindProxyGuard } from '../guards/bl-throttler-behind-proxy.guard';
import { BlReflectorHelper } from '../utils/bl-reflector.helper';

const publicMetadata = 'isPublic';

/**
 * @Public decorator for method or class to make a route public so the guard
 * don't check the existence of the token
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const BlPublic = (): CustomDecorator => SetMetadata(publicMetadata, true);

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
