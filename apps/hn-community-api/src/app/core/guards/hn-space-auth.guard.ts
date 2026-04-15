import { BlUnauthorizedException } from '@monorepo/back-core-lib';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { HnUserService } from '../../users/hn-user.service';
import { HnCoreConfigService } from '../modules/core-config/hn-core-config.service';
import { HnCurrentUserHelper } from '../utils/hn-current-user.helper';

@Injectable()
export class HnSpaceAuthGuard implements CanActivate {
  constructor(
    private readonly configService: HnCoreConfigService,
    private readonly userService: HnUserService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const apiKey = request.header('X-Api-Key');
    if (apiKey == null || apiKey !== this.configService.getSpaceApiKey()) {
      throw new BlUnauthorizedException();
    }

    const userId = request.header('user');
    let user = null;
    if (userId) {
      user = await this.userService.findOne(userId);
    }

    HnCurrentUserHelper.setAuthContext({
      type: 'space',
      user: user ?? undefined,
    });

    return true;
  }
}
