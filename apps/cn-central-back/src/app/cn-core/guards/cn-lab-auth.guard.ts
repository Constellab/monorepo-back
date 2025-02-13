import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CnLabsService } from '../../cn-labs/cn-labs.service';
import { Request } from 'express';
import { CnLab, CnLabWithSpace } from '../../cn-labs/cn-lab.entity';
import { CnUsersService } from '../../cn-users/cn-users.service';
import { CnCoreConfigService } from '../modules/cn-core-config/cn-core-config.service';
import { CnUser } from '../../cn-users/cn-user.entity';
import { CnErrorText } from '../model/config/cn-error-text.class';
import {
  cnExternalLabApiKeyHeader,
  cnExternalLabApiKeySchema,
  cnExternalLabManagerVersionHeader,
  cnExternalLabUserHeader,
} from '../model/config/cn-config.class';
import { CnCurrentUserHelper } from '../utils/cn-current-user.helper';
import { CnSpaceUserService } from '../../cn-spaces/cn-space-user.service';
import { CnSpaceUserRole } from '../../cn-spaces/cn-space-user.entity';
import { cnIsAllowedDev, cnIsLabRobotAuth } from '../decorators/cn-lab-guard.decorator';
import { blIsDecoratedWithPublic, BlUnauthorizedException } from '@monorepo/back-core-lib';
import { CnLabUserService } from '../../cn-labs/user/cn-lab-user.service';

class CnGetLab {
  lab: CnLabWithSpace;
  labEnvironment: 'labDev' | 'labProd' | 'labManager';
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

  abstract getLabFromApiKey(apiKey: string): Promise<CnGetLab>;

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

    const labInfo = await this.getLabFromApiKey(labApiKey);

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
    const userWithRole = await this.getUserInContext(request, labInfo.lab, context);

    if (labInfo.labEnvironment === 'labManager') {
      // retrieve the lab manager version from header
      const labManagerVersion = request.header(cnExternalLabManagerVersionHeader);

      CnCurrentUserHelper.setAuthContext({
        type: 'labManager',
        user: userWithRole.user,
        lab: labInfo.lab,
        space: labInfo.lab.space,
        roleInSpace: userWithRole.role,
        labManagerVersion: labManagerVersion,
      });
    } else {
      CnCurrentUserHelper.setAuthContext({
        type: labInfo.labEnvironment,
        user: userWithRole.user,
        lab: labInfo.lab,
        space: labInfo.lab.space,
        roleInSpace: userWithRole.role,
      });
    }

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
    lab: CnLab,
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

      return this.getUser(lab, userId);
    }
  }

  /**
   * Set the real user in the request context and check if the user has access to the lab and space
   * @param lab
   * @param userId
   * @private
   */
  private async getUser(lab: CnLab, userId: string): Promise<CnUserWithRole> {
    const user: CnUser = await this.usersService.findById(userId);

    if (user == null) {
      this.logger.error(`Can't find the user with id ${userId}`);
      throw new BlUnauthorizedException(`Can't find the user with id ${userId}`);
    }

    if (user.isAdmin()) {
      return { user: user, role: CnSpaceUserRole.ADMIN };
    } else {
      // check if the user has access to the lab
      const labUser = await this.labUserService.findByLabIdAndUserId(lab.id, userId);
      if (labUser == null) {
        throw new BlUnauthorizedException(CnErrorText.USER_NOT_IN_LAB);
      }

      const spaceUser = await this.spaceUserService.getSpaceUserIfAccess(lab.spaceId, user.id);
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

  private getLabApiKeyFromRequest(request: Request): string {
    // get the api-key from header without the 'API-KEY'
    return request.header(cnExternalLabApiKeyHeader)?.replace(`${cnExternalLabApiKeySchema} `, '') ?? null;
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
   * @param apiKey
   */
  async getLabFromApiKey(apiKey: string): Promise<CnGetLab> {
    const lab = await this.labsService.findLabByGlabProdApiKey(apiKey);
    if (lab) {
      return {
        lab: lab,
        labEnvironment: 'labProd',
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
