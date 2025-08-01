import {
  BlCredentials,
  BlCredentials2Fa,
  BlExternalApiService,
  BlUnauthorizedException,
} from '@monorepo/back-core-lib';
import { Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';

import { HnCoreConfigService } from '../core/modules/core-config/hn-core-config.service';
import { HnUser } from '../users/hn-user.entity';

export interface HnExternalCheckCredentialResponse {
  status: 'OK' | '2FA_REQUIRED' | 'ERROR';
  user?: HnUser;
  twoFAUrlCode?: string;
  error?: any;
}

/**
 * Service to call space auth routes
 */
@Injectable()
export class HnSpaceAuthService {
  constructor(
    private blExternalApiService: BlExternalApiService,
    private coreConfigService: HnCoreConfigService
  ) {}

  async checkUserCredential(credentials: BlCredentials): Promise<HnExternalCheckCredentialResponse> {
    try {
      return await lastValueFrom(
        this.blExternalApiService.post(this.buildRoute('external/check-credentials'), credentials)
      );
    } catch (e: any) {
      return {
        status: 'ERROR',
        error: e,
      };
    }
  }

  async check2FA(credentials: BlCredentials2Fa): Promise<HnUser> {
    try {
      return await lastValueFrom(
        this.blExternalApiService.post(this.buildRoute('external/check-2fa'), credentials)
      );
    } catch (e: any) {
      if (e.status >= 500 && e.status < 600) {
        throw new BlUnauthorizedException('Space disconnected');
      }
      throw e;
    }
  }

  private buildRoute(route: string): string {
    return this.coreConfigService.getSpaceApiUrl() + 'auth/' + route;
  }
}
