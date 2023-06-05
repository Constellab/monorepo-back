import {applyDecorators, ExecutionContext, SetMetadata, UseGuards} from '@nestjs/common';
import {CustomDecorator} from '@nestjs/common/decorators/core/set-metadata.decorator';
import {Reflector} from '@nestjs/core';
import {BlReflectorHelper} from '../utils/bl-reflector.helper';
import {Throttle, ThrottlerGuard} from '@nestjs/throttler';

const publicMetadata = 'isPublic';

/**
 * @Public decorator for method or class to make a route public so the guard
 * don't check the existence of the token
 */
export const BlPublic = (): CustomDecorator => SetMetadata(publicMetadata, true);

/**
 * @PublicSecure decorator for method or class to make a route public so the guard
 * don't check the existence of the token.
 * It also add a ThrottlerGuard to prevent brute force attack
 * @constructor
 */
export const BlPublicSecure = (options ?:{limit: number, ttl: number}): any => {
  const decorators = [
    SetMetadata(publicMetadata, true),
    UseGuards(ThrottlerGuard),
  ];
  if (options) {
    decorators.push(Throttle(options.limit, options.ttl));
  }
  return applyDecorators(
    ...decorators,
  );
};

/**
 * return true if the method or class is decorated with @Public
 */
export function blIsDecoratedWithPublic(reflector: Reflector, context: ExecutionContext): boolean {
  // Check if the route is annotated with @Public
  return BlReflectorHelper.getClassOrMethodMetadata(reflector, context, publicMetadata);
}
