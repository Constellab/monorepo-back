import {CanActivate, ExecutionContext, Injectable, Logger, UnauthorizedException} from '@nestjs/common';
import {Reflector} from '@nestjs/core';
import {CnLabInstancesService} from '../../cn-lab-instances/cn-lab-instances.service';
import {Request} from 'express';
import {CnLabInstance} from '../../cn-lab-instances/cn-lab-instance.entity';
import {CnUsersService} from '../../cn-users/cn-users.service';
import {CnCoreConfigService} from '../modules/cn-core-config/cn-core-config.service';
import {CnUser} from '../../cn-users/cn-user.entity';
import {CnErrorText} from '../model/config/cn-error-text.class';
import {
  cnExternalLabApiKeyHeader,
  cnExternalLabApiKeySchema,
  cnExternalLabUserHeader
} from '../model/config/cn-config.class';
import {CnCurrentUserHelper} from '../utils/cn-current-user.helper';

/**
 * Guard to authenticate route called by the lab servers.
 * Authentication is made with apiKey
 *
 * It set the LabInstance and the Robot user in the request
 */
@Injectable()
export class CnLabAuthGuard implements CanActivate {

  private readonly logger = new Logger(CnLabAuthGuard.name);

  constructor(private reflector: Reflector,
              private labInstancesService: CnLabInstancesService,
              private usersService: CnUsersService,
              private configService: CnCoreConfigService) {
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    return this.labAuthentication(context);
  }

  private async labAuthentication(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const labApiKey: string = this.getLabApiKeyFromRequest(request);

    if (labApiKey == null) {
      throw new UnauthorizedException(CnErrorText.MISSING_API_KEY);
    }

    const labInstance: CnLabInstance = await this.labInstancesService.findLabByApiKey(labApiKey);

    if (labInstance == null) {
      throw new UnauthorizedException(CnErrorText.WRONG_API_KEY);
    }

    // store the labInstance in the current context
    CnCurrentUserHelper.setCurrentLabInstance(labInstance);

    // set the robot user in the context as the connected user
    await this.setContext(request);

    return true;
  }

  /**
   * Set the context user in the request context. If there is a user id in the request,
   * set the user in the context, otherwise set the robot user
   * @param request
   * @private
   */
  private async setContext(request: Request): Promise<void> {
    const userId: string = this.getLabUserIdFromRequest(request);

    if (userId == null) {
      await this.setRobotUserInContext(request);
    } else {
      await this.setUserInContext(request, userId);
    }
  }

  private async setUserInContext(request: Request, userId: string): Promise<void> {
    const user: CnUser = await this.usersService.findById(userId);

    if (user == null) {
      this.logger.error(`Can't find the user with id ${userId}`);
      throw new UnauthorizedException();
    }

    request.user = user;
  }

  // set the robot user in request user
  private async setRobotUserInContext(request: Request): Promise<void> {
    // get the robot user
    const robotMail: string = this.configService.getRobotUserMail();
    const user: CnUser = await this.usersService.findByEmail(robotMail);

    if (user == null) {
      this.logger.error(`The robot user with mail ${robotMail} does not exist`);
      throw  new UnauthorizedException();
    }

    request.user = user;
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
