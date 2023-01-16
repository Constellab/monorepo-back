import {Injectable} from '@nestjs/common';
import {CmCredentials, CmCredentials2Fa, CmUserCategory} from '@monorepo/common-model';
import {BlExternalApiService, BlUnauthorizedException} from '@monorepo/back-core-lib';
import {HnCoreConfigService} from '../core/modules/core-config/hn-core-config.service';
import {lastValueFrom} from 'rxjs';
import {HnUser} from '../users/hn-user.entity';
import {ClSupportedLanguage} from '@monorepo/core-lib';

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

  async checkUserCredentialAndAdmin(credentials: CmCredentials): Promise<HnExternalCheckCredentialResponse> {
    try {
      return await lastValueFrom(this.blExternalApiService
        .post(this.buildRoute('external/check-credentials/true'), credentials));

    } catch (e: any) {
      if (e.status >= 500 && e.status < 600) {
        throw new BlUnauthorizedException('Central disconnected');
      }
      throw e;
    }
  }

  async check2FA(credentials: CmCredentials2Fa): Promise<HnUser> {
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

