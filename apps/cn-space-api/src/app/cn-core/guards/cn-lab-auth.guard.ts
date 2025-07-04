import { blIsDecoratedWithPublic, BlUnauthorizedException } from '@monorepo/back-core-lib';
import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { CnLabWithSpace } from '../../cn-labs/cn-lab.entity';
import { CnLabsService } from '../../cn-labs/cn-labs.service';
import { CnLabUserService } from '../../cn-labs/user/cn-lab-user.service';
import { CnSpaceUserRole } from '../../cn-spaces/cn-space-user.entity';
import { CnSpaceUserService } from '../../cn-spaces/cn-space-user.service';
import { CnUserSpaceInfo } from '../../cn-users/cn-user.dto';
import { CnUser } from '../../cn-users/cn-user.entity';
import { CnUsersService } from '../../cn-users/cn-users.service';
import { cnIsAllowedDev, cnIsLabRobotAuth } from '../decorators/cn-lab-guard.decorator';
import {
  cnExternalLabApiKeyHeader,
  cnExternalLabApiKeySchema,
  cnExternalLabApiTokenHeader,
  cnExternalLabManagerVersionHeader,
  cnExternalLabQueryParamKeyHeader,
  cnExternalLabUserHeader,
} from '../model/config/cn-config.class';
import { CnErrorText } from '../model/config/cn-error-text.class';
import { CnCoreConfigService } from '../modules/cn-core-config/cn-core-config.service';
import {
  CnAuthContext,
  CnAuthContextLab,
  CnAuthContextLabManager,
  CnAuthContextLabToken,
} from '../utils/cn-auth-context.class';
import { CnCurrentUserHelper } from '../utils/cn-current-user.helper';

class CnGetLab {
  lab: CnLabWithSpace;
  labEnvironment: 'labDev' | 'labProd' | 'labManager' | 'labToken';
}

class CnUserWithRole {
  user: CnUser;
  role: CnSpaceUserRole;
}

export abstract class CnLabAuthGuardBase implements CanActivate {
  private readonly logger = new Logger(CnLabAuthGuard.name);

  protected constructor(
    private reflector: Reflector,
    private usersService: CnUsersService,
    private configService: CnCoreConfigService,
    private spaceUserService: CnSpaceUserService,
    private labUserService: CnLabUserService
  ) {}

  abstract getLabFromApiKey(apiKey: string, request: Request): Promise<CnGetLab>;

  async canActivate(context: ExecutionContext): Promise<boolean> {
    return this.labAuthentication(context);
  }

  private async labAuthentication(context: ExecutionContext): Promise<boolean> {
    // Check if the route is annotated with @Public
    // if yes, don't check the authorization
    if (blIsDecoratedWithPublic(this.reflector, context)) {
      return true;
    }

    const request: Request = context.switchToHttp().getRequest();
    const labApiKey: string = this.getLabApiKeyFromRequest(request);

    if (labApiKey == null) {
      throw new BlUnauthorizedException(CnErrorText.MISSING_API_KEY);
    }

    const labInfo = await this.getLabFromApiKey(labApiKey, request);

    if (labInfo == null) {
      throw new BlUnauthorizedException(CnErrorText.WRONG_API_KEY);
    }

    // if the lab is in dev environment, check if the dev api key is allowed
    // the route should be annotated with @LabAllowDev
    if (labInfo.labEnvironment === 'labDev') {
      if (!cnIsAllowedDev(this.reflector, context)) {
        throw new BlUnauthorizedException(CnErrorText.LAB_ROUTE_NOT_ALLOWED_FOR_DEV);
      }
    }

    // set the user in the context as the connected user
    const userWithRole = await this.getUserInContext(request, labInfo, context);

    const userInfo = new CnUserSpaceInfo(userWithRole.user, labInfo.lab.space, userWithRole.role);

    let authContext: CnAuthContext;
    if (labInfo.labEnvironment === 'labManager') {
      // retrieve the lab manager version from header
      const labManagerVersion = request.header(cnExternalLabManagerVersionHeader);

      authContext = new CnAuthContextLabManager(userInfo, labInfo.lab, labManagerVersion);
    } else if (labInfo.labEnvironment === 'labToken') {
      // for lab token, we don't store user role in space in the context
      authContext = new CnAuthContextLabToken(userInfo.user, userInfo.space, labInfo.lab);
    } else {
      authContext = new CnAuthContextLab(labInfo.labEnvironment, userInfo, labInfo.lab);
    }

    // set the context in the request
    CnCurrentUserHelper.setAuthContext(authContext);

    return true;
  }

  /**
   * Set the context user in the request context.
   * If the route is annotated with ClLabRobotAuthentication, the robot user is set in the request context
   * Otherwise the user from the request is set in the request context
   * @private
   */
  private async getUserInContext(
    request: Request,
    labInfo: CnGetLab,
    context: ExecutionContext
  ): Promise<CnUserWithRole> {
    // if the route is annotated with ClLabRobotAuthentication, set the robot user in the context
    if (cnIsLabRobotAuth(this.reflector, context)) {
      return this.getRobotUserInContext();
    } else {
      const userId: string = this.getLabUserIdFromRequest(request);

      if (userId == null) {
        throw new BlUnauthorizedException(CnErrorText.LAB_REQ_NO_USER_IN_CONTEXT);
      }

      return this.getAndCheckUser(labInfo, userId);
    }
  }

  /**
   * Retrieve the user and check if the user has access to the lab and space
   * @param labInfo
   * @param userId
   * @private
   */
  private async getAndCheckUser(labInfo: CnGetLab, userId: string): Promise<CnUserWithRole> {
    const user: CnUser = await this.usersService.findById(userId);

    if (user == null) {
      this.logger.error(`Can't find the user with id ${userId}`);
      throw new BlUnauthorizedException(`Can't find the user with id ${userId}`);
    }

    if (user.isAdmin()) {
      return { user: user, role: CnSpaceUserRole.ADMIN };
    } else {
      // for lab token auth, we don't check the user in the lab
      // TODO improve for lab token
      if (labInfo.labEnvironment !== 'labToken') {
        // check if the user has access to the lab
        const labUser = await this.labUserService.findByLabIdAndUserId(labInfo.lab.id, userId);
        if (labUser == null) {
          throw new BlUnauthorizedException(CnErrorText.USER_NOT_IN_LAB);
        }
      }

      const spaceUser = await this.spaceUserService.getSpaceUserIfAccess(labInfo.lab.spaceId, user.id);
      // if the user is not part of the space of his account is not active for this space
      // don't allow the user to access the route
      if (spaceUser == null) {
        throw new BlUnauthorizedException(CnErrorText.USER_NOT_IN_SPACE);
      }

      return { user: user, role: spaceUser.role };
    }
  }

  // get the robot user as Admin
  private async getRobotUserInContext(): Promise<CnUserWithRole> {
    // get the robot user
    const robotMail: string = this.configService.getRobotUserMail();
    const user: CnUser = await this.usersService.findByEmail(robotMail);

    if (user == null) {
      this.logger.error(`The robot user with mail ${robotMail} does not exist`);
      throw new BlUnauthorizedException();
    }

    return { user: user, role: CnSpaceUserRole.ADMIN };
  }

  private getLabApiKeyFromRequest(request: Request): string | null {
    // get the api-key from header without the 'API-KEY'
    const authorization = request.header(cnExternalLabApiKeyHeader);
    if (authorization != null) {
      return authorization.replace(`${cnExternalLabApiKeySchema} `, '');
    }

    const queryAuthorization = request.query[cnExternalLabQueryParamKeyHeader];
    if (queryAuthorization != null) {
      return queryAuthorization.toString();
    }

    return null;
  }

  private getLabUserIdFromRequest(request: Request): string | null {
    // get user id from the request if it exists
    return request.header(cnExternalLabUserHeader) ?? null;
  }
}

/**
 * Guard to authenticate route called by the lab servers.
 * Authentication is made with apiKey
 *
 * It set the Lab and the user or Robot in the request
 */
@Injectable()
export class CnLabAuthGuard extends CnLabAuthGuardBase {
  constructor(
    private labsService: CnLabsService,
    reflector: Reflector,
    usersService: CnUsersService,
    configService: CnCoreConfigService,
    spaceUserService: CnSpaceUserService,
    labUserService: CnLabUserService
  ) {
    super(reflector, usersService, configService, spaceUserService, labUserService);
  }

  /**
   * Try to get the lab from prod api key and then from dev api key
   */
  async getLabFromApiKey(apiKey: string, request: Request): Promise<CnGetLab> {
    // TODO improve for lab token
    // if the header exist it means that the lab is using a token to authenticate
    const labApiToken = request.header(cnExternalLabApiTokenHeader);

    const lab = await this.labsService.findLabByGlabProdApiKey(apiKey);
    if (lab) {
      return {
        lab: lab,
        labEnvironment: labApiToken != null ? 'labToken' : 'labProd',
      };
    }

    const labDev = await this.labsService.findLabByGlabDevApiKey(apiKey);
    if (labDev) {
      return {
        lab: labDev,
        labEnvironment: 'labDev',
      };
    }

    return null;
  }
}

/**
 * Guard to authenticate route called by the lab manager.
 * Authentication is made with apiKey
 *
 * It set the Lab and the user or Robot in the request
 */
@Injectable()
export class CnLabManagerAuthGuard extends CnLabAuthGuardBase {
  constructor(
    private labsService: CnLabsService,
    reflector: Reflector,
    usersService: CnUsersService,
    configService: CnCoreConfigService,
    spaceUserService: CnSpaceUserService,
    labUserService: CnLabUserService
  ) {
    super(reflector, usersService, configService, spaceUserService, labUserService);
  }

  async getLabFromApiKey(apiKey: string): Promise<CnGetLab> {
    const lab = await this.labsService.findLabByManagerApiKey(apiKey);

    if (lab) {
      return {
        lab: lab,
        labEnvironment: 'labManager',
      };
    }

    return null;
  }
}
