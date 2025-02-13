import { ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { CnErrorText } from '../model/config/cn-error-text.class';
import { cnIsDecoratedWithLabAuth } from '../decorators/cn-lab-guard.decorator';
import {
  BlCookieHelper,
  blIsDecoratedWithPublic,
  BlRequestContext,
  BlUnauthorizedException,
} from '@monorepo/back-core-lib';
import { CnCurrentUserHelper, CnRequest } from '../utils/cn-current-user.helper';
import { CnSpaceUserService } from '../../cn-spaces/cn-space-user.service';
import { CnSpaceUserRole } from '../../cn-spaces/cn-space-user.entity';
import { cnIsDecoratedWithLabManagerAuth } from '../decorators/cn-lab-manager-guard.decorator';
import { CnUsersService } from '../../cn-users/cn-users.service';
import { CnSpace } from '../../cn-spaces/cn-space.entity';
import { ClStringHelper } from '@monorepo/core-lib';
import { CnCoreConfigService } from '../modules/cn-core-config/cn-core-config.service';
import { CnSpaceService } from '../../cn-spaces/cn-space.service';

export const CN_LOCAL_SPACE_COOKIE = 'local-space';

/**
 * Guard to check if the user has an authentication token
 * Methods and classes annotated with @Public decorator
 * don't need to check if authentication token exists
 *
 * Methods and classes annotated with @LabAuth are manager by the {@link CnLabAuthGuard}
 *
 * Others use JWT authentication with {@link BlJwtStrategy}
 */
@Injectable()
export class CnJwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(CnJwtAuthGuard.name);

  constructor(
    private reflector: Reflector,
    private spaceUserService: CnSpaceUserService,
    private userService: CnUsersService,
    private configService: CnCoreConfigService,
    private spaceService: CnSpaceService
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if the route is annotated with @Public
    // if yes, don't check the authorization
    if (this.contextIsPublic(context)) {
      return true;
    }

    // if the method or class is annotated with @LabGuard
    // authentication is manage by {@link CnLabAuthGuard} or {@link CnLabManagerAuthGuard}
    if (this.contextIsLabAuth(context)) {
      return true;
    }

    // jwt authentication
    try {
      // this set the user in the request (accessible by CnCurrentUserHelper)
      const result = await (super.canActivate(context) as Promise<boolean>);
      if (!result) return false;
    } catch (error) {
      throw new BlUnauthorizedException(CnErrorText.WRONG_TOKEN);
    }

    const request = BlRequestContext.currentContext.req as CnRequest;

    // the user is available in the request from super.canActivate
    const user = request.user;
    if (user == null) {
      return false;
    }

    // retrieve the space
    const space = await this.getSpaceFromRequest(request);

    // if a space is in the context, check if the user is in the space
    if (space) {
      let roleInSpace: CnSpaceUserRole = null;
      // consider a G admin as an admin of all spaces
      if (user.isAdmin()) {
        roleInSpace = CnSpaceUserRole.ADMIN;
      } else {
        const spaceUser = await this.spaceUserService.getSpaceUserIfAccess(space.id, user.id);

        // if the user is not part of the space of his account is not active for this space
        // don't allow the user to access the route
        if (spaceUser == null) {
          return false;
        }

        roleInSpace = spaceUser.role;
      }

      // set the auth context as user in the space
      CnCurrentUserHelper.setAuthContext({
        type: 'user',
        user: user,
        space: space,
        roleInSpace: roleInSpace,
      });

      if (user.lastConnectedSpaceId !== space.id) {
        this.userService
          .updateLastConnectedSpace(user.id, space.id)
          .catch((err) =>
            this.logger.error(
              `Error updating last connected space for user ${user.id} and space ${space.id}. Error '${err}'`
            )
          );
        user.lastConnectedSpaceId = space.id;
      }
    } else {
      // set the auth context as user without space
      CnCurrentUserHelper.setAuthContext({
        type: 'userNoSpace',
        user: user,
      });
    }
    return true;
  }

  private async getSpaceFromRequest(request: CnRequest): Promise<CnSpace | null> {
    let spaceDomain: string;

    if (this.configService.isLocal()) {
      spaceDomain = BlCookieHelper.getCookieFromHeader(request.headers.cookie, CN_LOCAL_SPACE_COOKIE);
    } else {
      const origin = request.header('origin') ?? request.header('referer');
      spaceDomain = ClStringHelper.getLowestDomainFromUrl(origin);
    }

    // retrieve the space and store it in the request if found
    return this.spaceService.findByDomain(spaceDomain);
  }

  /**
   * Return true if the context method or class is annotated with the @Public decorator
   */
  private contextIsPublic(context: ExecutionContext): boolean {
    // Check if the route is annotated with @Public
    return blIsDecoratedWithPublic(this.reflector, context);
  }

  /**
   * Return true if the context method or class is annotated with the @LabAuth or @LabManagerAuth decorator
   */
  private contextIsLabAuth(context: ExecutionContext): boolean {
    // Check if the route is annotated with @LabAuth or @LabManagerAuth
    return (
      cnIsDecoratedWithLabAuth(this.reflector, context) ||
      cnIsDecoratedWithLabManagerAuth(this.reflector, context)
    );
  }
}
