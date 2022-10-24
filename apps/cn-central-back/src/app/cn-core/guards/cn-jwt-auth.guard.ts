import {ExecutionContext, Injectable, UnauthorizedException} from '@nestjs/common';
import {AuthGuard} from '@nestjs/passport';
import {Reflector} from '@nestjs/core';
import {CnErrorText} from '../model/config/cn-error-text.class';
import {cnIsDecoratedWithLabAuth} from '../decorators/cn-lab-guard.decorator';
import {blIsDecoratedWithPublic} from '@monorepo/back-core-lib';
import {CnCurrentUserHelper} from '../utils/cn-current-user.helper';
import {CnOrganizationUserService} from '../../cn-organizations/cn-organization-user.service';

/**
 * Guard to check if the user has a authentication token
 * Methods and classes annotated with @Public decorator
 * don't need to check if authentication token exists
 *
 * Methods and classes annotated with @LabAuth are manager by the {@link CnLabAuthGuard}
 *
 * Others use JWT authentication with {@link BlJwtStrategy}
 */
@Injectable()
export class CnJwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector,
              private organizationUserService: CnOrganizationUserService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if the route is annotated with @Public
    // if yes, don't check the authorization
    if (this.contextIsPublic(context)) {
      return true;
    }

    // if the method or class is annotated with @LabGuard
    // authentication is manage by {@link CnLabAuthGuard}
    if (this.contextIsLabAuth(context)) {
      return true;
    }

    // jwt authentication
    try {
      const result = await (super.canActivate(context) as Promise<boolean>);
      if (!result) return false;
    } catch (error) {
      throw new UnauthorizedException(CnErrorText.WRONG_TOKEN);
    }

    const user = CnCurrentUserHelper.getAndCheckCurrentUser();
    const organization = CnCurrentUserHelper.getCurrentOrganization();

    // if an organization is in the context, check if the user is in the organization
    // noinspection RedundantIfStatementJS
    if (organization && !(await this.organizationUserService.userIsOrganizationMember(user.id, organization.id))) {
      return false;

    }
    return true;
  }

  /**
   * Return true if the context method or class is annotated with the @Public decorator
   */
  private contextIsPublic(context: ExecutionContext): boolean {
    // Check if the route is annotated with @Public
    return blIsDecoratedWithPublic(this.reflector, context);
  }

  /**
   * Return true if the context method or class is annotated with the @LabAuth decorator
   */
  private contextIsLabAuth(context: ExecutionContext): boolean {
    // Check if the route is annotated with @LabAuth
    return cnIsDecoratedWithLabAuth(this.reflector, context);
  }

}
