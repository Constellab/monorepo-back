import {ExecutionContext, Injectable} from '@nestjs/common';
import {AuthGuard} from '@nestjs/passport';
import {Reflector} from '@nestjs/core';
import {HnErrorText} from '../model/config/hn-error-text.class';
import {blIsDecoratedWithPublic, BlUnauthorizedException} from '@monorepo/back-core-lib';

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
      if(await (super.canActivate(context) as Promise<boolean>)){
        return true
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
