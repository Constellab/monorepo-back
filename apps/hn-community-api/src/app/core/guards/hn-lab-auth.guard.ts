import { BlRequestContextHelper, BlUnauthorizedException } from '@monorepo/back-core-lib';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { HnUser } from '../../users/hn-user.entity';
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

  /**
   * Returns the lab API key from the current request's authorization header.
   * Usable from any code executed within a request scope (controller, service, aggregate),
   * including on public routes where no auth context is set.
   */
  static getLabApiKey(): string | null {
    const request = BlRequestContextHelper.getCurrentRequest();
    return request?.header('authorization') ?? null;
  }

  /**
   * Same as getLabApiKey, but throws BlUnauthorizedException if missing.
   */
  static getAndCheckLabApiKey(): string {
    const labApiKey = this.getLabApiKey();
    if (!labApiKey) {
      throw new BlUnauthorizedException('Missing lab API key in authorization header');
    }
    return labApiKey;
  }

  private async labAuthentication(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const labApiKey = request.header('authorization');
    if (labApiKey == null) {
      throw new BlUnauthorizedException();
    }

    const allowWithoutUser = hnIsLabAllowWithoutUserAuth(this.reflector, context);

    let checkApiKeyResult: { labId: string; userId?: string };

    if (allowWithoutUser) {
      checkApiKeyResult = await this.spaceApiService.verifyLabApiKeyWithoutUser(labApiKey);
    } else {
      if (request.header('user') == null) {
        throw new BlUnauthorizedException();
      }
      checkApiKeyResult = await this.spaceApiService.verifyLabApiKey(labApiKey, request.header('user'));
    }

    if (!checkApiKeyResult?.labId) {
      throw new BlUnauthorizedException();
    }

    let currentUser: HnUser | undefined;
    if (!allowWithoutUser) {
      currentUser = await this.userService.findOne(request.header('user'));
      if (!currentUser) throw new BlUnauthorizedException();
    }

    HnCurrentUserHelper.setAuthContext({
      type: 'lab',
      user: currentUser,
      labId: checkApiKeyResult.labId,
      labApiKey,
    });

    return true;
  }
}
