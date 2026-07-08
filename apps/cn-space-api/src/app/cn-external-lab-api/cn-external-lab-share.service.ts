import { BlVersion } from '@monorepo/back-core-lib';
import { Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';

import { CnGwsCoreVersion } from '../cn-bricks/cn-brick.dto';
import { CnLabConfigsService } from '../cn-lab-configs/cn-lab-configs.service';
import { CnLab } from '../cn-labs/cn-lab.entity';
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

  constructor(
    private externalLabApiService: CnExternalLabApiService,
    private labConfigsService: CnLabConfigsService
  ) {}

  /**
   * Generate user access token for a share link (for resource).
   *
   * From gws_core 0.23.1 the lab expects a { user } dict (see
   * CnGwsCoreVersion._0_23_1); older labs expect a bare user object. The lab's
   * gws_core version is resolved here to pick the right body shape.
   *
   * Recent labs return embedded_url (open in place) and standalone_url (open
   * standalone, e.g. new tab through the launcher gateway). Legacy labs instead
   * return a single access_url used for both.
   */
  public async generateUserAccessToken(
    lab: CnLab,
    token: string,
    user: CnExternalLabUser
  ): Promise<CnExternalLabShareGenerateTokenResponse> {
    const useDictBody = await this.labSupportsGenerateTokenDictBody(lab);
    const body = useDictBody ? { user } : user;

    return lastValueFrom(
      this.externalLabApiService.post(
        lab.getGlabSpaceApiInfo(),
        `${this.route}/${token}/generate-user-access-token`,
        body,
        CnExternalLabShareGenerateTokenResponse
      )
    );
  }

  /**
   * Whether the lab's gws_core version expects the { user } dict body on the
   * generate-user-access-token share route (gws_core >= 0.23.1). Falls back to
   * false (legacy bare-user body) when the version is unknown.
   */
  private async labSupportsGenerateTokenDictBody(lab: CnLab): Promise<boolean> {
    const gwsCoreVersion = await this.labConfigsService.getGwsCoreVersion(lab);
    if (!gwsCoreVersion) {
      return false;
    }

    const dictBodyVersion = BlVersion.fromString(CnGwsCoreVersion._0_23_1);
    return gwsCoreVersion.version.isGreaterThanOrEqualTo(dictBodyVersion);
  }
}
