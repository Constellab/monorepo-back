import { Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';

import { CnExternalApiInfo } from '../cn-core/model/config/cn-config.class';
import { CnExternalLabApiService } from './cn-external-lab-api.service';
import {
  CnExternalLabShareGenerateTokenResponse,
  CnExternalLabUser,
} from './model/cn-external-lab-api.class';

/**
 * Service to call route for share object in the lab
 */
@Injectable()
export class CnExternalLabShareService {
  private readonly route: string = 'share';

  constructor(private externalLabApiService: CnExternalLabApiService) {}

  /**
   * Generate user access token for a share link (for resource)
   */
  public generateUserAccessToken(
    labInfo: CnExternalApiInfo,
    token: string,
    user: CnExternalLabUser
  ): Promise<CnExternalLabShareGenerateTokenResponse> {
    return lastValueFrom(
      this.externalLabApiService.post(
        labInfo,
        `${this.route}/${token}/generate-user-access-token`,
        user,
        CnExternalLabShareGenerateTokenResponse
      )
    );
  }
}
