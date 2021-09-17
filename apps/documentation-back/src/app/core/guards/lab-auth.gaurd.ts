import {CanActivate, ExecutionContext, Injectable, Logger, UnauthorizedException} from '@nestjs/common';
import {Reflector} from '@nestjs/core';
import {LabInstancesService} from '../../lab-instances/lab-instances.service';
import {Request} from 'express';
import {LabInstance} from '../../lab-instances/lab-instance.entity';
import {UsersService} from '../../users/users.service';
import {CoreConfigService} from '../modules/core-config/core-config.service';
import {User} from '../../users/user.entity';
import {ErrorText} from '../model/config/error-text.class';
import {externalLabApiKeyHeader, externalLabApiKeySchema} from '../model/config/external-lab.class';

/**
 * Guard to authenticate route called by the lab servers.
 * Authentication is made with apiKey
 *
 * It set the LabInstance and the Robot user in the request
 */
@Injectable()
export class LabAuthGuard implements CanActivate {

  private readonly logger = new Logger(LabAuthGuard.name);

  constructor(private reflector: Reflector,
              private labInstancesService: LabInstancesService,
              private usersService: UsersService,
              private configService: CoreConfigService) {
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    return this.labAuthentication(context);
  }

  private async labAuthentication(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const labApiKey: string = this.getLabApiKeyFromRequest(request);

    if (labApiKey == null) {
      throw new UnauthorizedException(ErrorText.MISSING_API_KEY);
    }

    const labInstance: LabInstance = await this.labInstancesService.findLabByApiKey(labApiKey);

    if (labInstance == null) {
      throw new UnauthorizedException(ErrorText.WRONG_API_KEY);
    }

    // store the labInstance in the authInfo
    request.authInfo = labInstance;

    // set the robot user in the context as the connected user
    await this.setRobotUserInContext(request);

    return true;
  }

  // set the robot user in request user
  private async setRobotUserInContext(request: Request): Promise<void> {
    // get the robot user
    const robotMail: string = this.configService.getRobotUserMail();
    const user: User = await this.usersService.findByEmail(robotMail);

    if (user == null) {
      this.logger.error(`The robot user with mail ${robotMail} does not exist`);
      throw  new UnauthorizedException();
    }

    request.user = user;
  }

  private getLabApiKeyFromRequest(request: Request): string {
    // get the api-key from header without the 'API-KEY'
    return request.header(externalLabApiKeyHeader)?.replace(`${externalLabApiKeySchema} `, '') || null;
  }

}
