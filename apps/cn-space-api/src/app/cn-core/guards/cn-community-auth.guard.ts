import { BlUnauthorizedException } from '@monorepo/back-core-lib';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { CnCoreConfigService } from '../modules/cn-core-config/cn-core-config.service';

/**
 * Guard for routes called by the Community API.
 * Validates the X-Api-Key header against the COMMUNITY_API_KEY config.
 */
@Injectable()
export class CnCommunityAuthGuard implements CanActivate {
  constructor(private readonly configService: CnCoreConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.header('X-Api-Key');

    if (apiKey == null || apiKey !== this.configService.getCommunityApiKey()) {
      throw new BlUnauthorizedException();
    }

    return true;
  }
}
