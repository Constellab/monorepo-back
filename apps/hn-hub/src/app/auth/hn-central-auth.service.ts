import {Injectable} from '@nestjs/common';
import {BlCredentials, BlCredentials2Fa, BlExternalApiService, BlUnauthorizedException} from '@monorepo/back-core-lib';
import {HnCoreConfigService} from '../core/modules/core-config/hn-core-config.service';
import {lastValueFrom} from 'rxjs';
import {HnUser} from '../users/hn-user.entity';

export interface HnExternalCheckCredentialResponse {
  status: 'OK' | '2FA_REQUIRED';
  user?: HnUser;
  twoFAUrlCode?: string;
}

/**
 * Service to call central auth routes
 */
@Injectable()
export class HnCentralAuthService {

  constructor(
    private blExternalApiService: BlExternalApiService,
    private coreConfigService: HnCoreConfigService) {
  }

  async checkUserCredential(credentials: BlCredentials): Promise<HnExternalCheckCredentialResponse> {
    try {
      return await lastValueFrom(this.blExternalApiService
        .post(this.buildRoute('external/check-credentials'), credentials));

    } catch (e: any) {
      if (e.status >= 500 && e.status < 600) {
        throw new BlUnauthorizedException('Central disconnected');
      }
      throw e;
    }
  }

  async check2FA(credentials: BlCredentials2Fa): Promise<HnUser> {
    try {
      return await lastValueFrom(
        this.blExternalApiService.post(this.buildRoute('external/check-2fa'), credentials));

    } catch (e: any) {
      if (e.status >= 500 && e.status < 600) {
        throw new BlUnauthorizedException('Central disconnected');
      }
      throw e;
    }
  }

  private buildRoute(route: string): string {
    return this.coreConfigService.getCentralApiUrl() + 'auth/' + route;
  }

}

