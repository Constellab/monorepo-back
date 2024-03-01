import {Injectable} from '@nestjs/common';
import {BlExternalApiService, BlUnauthorizedException} from '@monorepo/back-core-lib';
import {lastValueFrom} from 'rxjs';
import {HnCoreConfigService} from '../modules/core-config/hn-core-config.service';

@Injectable()
export class HnLabConstellabApiService {

  constructor(private readonly blExternalApiService: BlExternalApiService,
              private readonly coreConfigService: HnCoreConfigService) {
  }

  /**
   * Verify if the lab user is a good one by calling central
   * @param req
   * @private
   */
  public async checkApiKeyAndUserIdInCentral(req: Request): Promise<void> {
    if (req.headers['user'] == null || req.headers['authorization'] == null) {
      throw new BlUnauthorizedException();
    }
    const checkApiKeyUser: boolean = await lastValueFrom(this.blExternalApiService.get(
      this.coreConfigService.getCentralApiUrl() + 'external-labs/check-test', null,
      {headers: {user: req.headers['user'], authorization: req.headers['authorization']}}))
    if(checkApiKeyUser != true){
      throw new BlUnauthorizedException();
    }
  }
}
