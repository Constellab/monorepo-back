import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { HnErrorText } from '../model/config/hn-error-text.class';
import { blIsDecoratedWithPublic, BlRequestContext, BlUnauthorizedException } from '@monorepo/back-core-lib';
import { HnCurrentUserHelper, HnRequest } from '../utils/hn-current-user.helper';

/**
 * Guard to check if the user has a authentication token
 * Methods and classes annotated with @Public decorator
 * don't need to check if authentication token exists
 *
 * Others uses JWT authentication with {@link BlJwtStrategy}
 */
@Injectable()
export class HnJwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // jwt authentication
    try {
      if (await (super.canActivate(context) as Promise<boolean>)) {
        const request = BlRequestContext.currentContext.req as HnRequest;

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
      } else {
        // Check if the route is annotated with @Public
        // if yes, authorize
        return this.contextIsPublic(context);
      }
    } catch (error) {
      // Check if the route is annotated with @Public
      // if yes, authorize
      if (this.contextIsPublic(context)) {
        return true;
      }
      throw new BlUnauthorizedException(HnErrorText.WRONG_TOKEN);
    }
  }

  /**
   * Return true if the context method or class is annotated with the @Public decorator
   */
  private contextIsPublic(context: ExecutionContext): boolean {
    // Check if the route is annotated with @Public
    return blIsDecoratedWithPublic(this.reflector, context);
  }
}
