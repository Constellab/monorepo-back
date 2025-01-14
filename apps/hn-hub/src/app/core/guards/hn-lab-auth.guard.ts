import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { BlExternalApiService, BlUnauthorizedException } from '@monorepo/back-core-lib';
import { HnCoreConfigService } from '../modules/core-config/hn-core-config.service';
import { lastValueFrom } from 'rxjs';
import { HnUserService } from '../../users/hn-user.service';
import { HnCurrentUserHelper } from '../utils/hn-current-user.helper';
import { hnIsLabAllowWithoutUserAuth } from '../decorators/hn-lab-auth-guard.decorator';
import { Reflector } from '@nestjs/core';

@Injectable()
export class HnLabAuthGuard implements CanActivate {
  private readonly logger = new Logger(HnLabAuthGuard.name);

  constructor(
    private readonly blExternalApiService: BlExternalApiService,
    private readonly coreConfigService: HnCoreConfigService,
    private readonly userService: HnUserService,
    private reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    return this.labAuthentication(context);
  }

  private async labAuthentication(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    if (request.header('authorization') == null) {
      throw new BlUnauthorizedException();
    }

    const headers: any = {
      authorization: request.header('authorization'),
    };

    let url: string =
      this.coreConfigService.getCentralApiUrl() + 'external-community-labs/verify-without-user-rights';

    if (!hnIsLabAllowWithoutUserAuth(this.reflector, context)) {
      if (request.header('user') == null) {
        throw new BlUnauthorizedException();
      }

      headers['user'] = request.header('user');
      url = this.coreConfigService.getCentralApiUrl() + 'external-community-labs/verify-rights';
    }

    const checkApiKeyUser: boolean = await lastValueFrom(
      this.blExternalApiService.get(url, null, {
        headers: headers,
      })
    );
    if (checkApiKeyUser != true) {
      throw new BlUnauthorizedException();
    }

    if (hnIsLabAllowWithoutUserAuth(this.reflector, context)) {
      return true;
    }

    const currentUser = await this.userService.findOne(request.header('user'));
    if (!currentUser) throw new BlUnauthorizedException();

    HnCurrentUserHelper.setLabInstanceCurrentUser(currentUser);

    return true;
  }
}
