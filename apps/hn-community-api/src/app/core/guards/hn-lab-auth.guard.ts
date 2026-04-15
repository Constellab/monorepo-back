import { BlUnauthorizedException } from '@monorepo/back-core-lib';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { HnUserService } from '../../users/hn-user.service';
import { hnIsLabAllowWithoutUserAuth } from '../decorators/hn-lab-auth-guard.decorator';
import { HnExternalSpaceApiService } from '../service/hn-external-space-api.service';
import { HnCurrentUserHelper } from '../utils/hn-current-user.helper';

@Injectable()
export class HnLabAuthGuard implements CanActivate {
  constructor(
    private readonly spaceApiService: HnExternalSpaceApiService,
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

    let checkApiKeyResult: { labId: string; userId?: string };

    if (hnIsLabAllowWithoutUserAuth(this.reflector, context)) {
      checkApiKeyResult = await this.spaceApiService.verifyLabApiKeyWithoutUser(
        request.header('authorization')
      );
    } else {
      if (request.header('user') == null) {
        throw new BlUnauthorizedException();
      }
      checkApiKeyResult = await this.spaceApiService.verifyLabApiKey(
        request.header('authorization'),
        request.header('user')
      );
    }

    if (!checkApiKeyResult?.labId) {
      throw new BlUnauthorizedException();
    }

    if (hnIsLabAllowWithoutUserAuth(this.reflector, context)) {
      HnCurrentUserHelper.setAuthContext({
        type: 'labNoUser',
        labId: checkApiKeyResult.labId,
      });
      return true;
    }

    const currentUser = await this.userService.findOne(request.header('user'));
    if (!currentUser) throw new BlUnauthorizedException();

    HnCurrentUserHelper.setAuthContext({
      type: 'lab',
      user: currentUser,
      labId: checkApiKeyResult.labId,
    });

    return true;
  }
}
