import {Injectable} from '@nestjs/common';
import {lastValueFrom, Observable} from 'rxjs';
import {ClDeserializationRef} from '@monorepo/core-lib';
import {BlExternalApiHttpOption, BlExternalApiService} from '@monorepo/back-core-lib';
import {
  CnExternalApiInfo,
  cnExternalLabApiKeyHeader,
  cnExternalLabApiKeySchema,
  cnExternalLabUserHeader
} from '../cn-core/model/config/cn-config.class';
import {CnLabGlobalActivity} from './model/cn-external-lab-api.class';
import {CnCurrentUserHelper} from '../cn-core/utils/cn-current-user.helper';

/**
 * Service to call the api of a lab
 */
@Injectable()
export class CnExternalLabApiService {

  private readonly baseApiRoute: string = 'central-api';

  constructor(private apiService: BlExternalApiService) {
  }

  public async healthCheck(labInfo: CnExternalApiInfo): Promise<boolean> {
    return lastValueFrom(this.get(labInfo, `health-check`,
      null, {logError: false, timeout: 2500})).then(() => true).catch(() => false);
  }

  public async getSettings(labInfo: CnExternalApiInfo): Promise<any> {
    return lastValueFrom(this.get(labInfo, `settings`));
  }


  public async getLabGlobalActivity(labInfo: CnExternalApiInfo): Promise<CnLabGlobalActivity> {
    return lastValueFrom(this.get(labInfo, `lab/global-activity`));
  }

  /**
   * Make a http post with the ip of the lab and the API key of the lab in header
   */
  public post(labInfo: CnExternalApiInfo, route: string, body: any, classReference?: ClDeserializationRef,
              options: BlExternalApiHttpOption = {}): Observable<any> {
    return this.apiService.post(this.constructRoute(labInfo.apiUrl, route), body,
      classReference, this.getRequestOptions(labInfo.apiKey, options));
  }

  /**
   * Make a http put with the ip of the lab and the API key of the lab in header
   */
  public put(labInfo: CnExternalApiInfo, route: string, body: any, classReference?: ClDeserializationRef,
             options: BlExternalApiHttpOption = {}): Observable<any> {
    return this.apiService.put(this.constructRoute(labInfo.apiUrl, route), body,
      classReference, this.getRequestOptions(labInfo.apiKey, options));
  }

  /**
   * Make a http put with the ip of the lab and the API key of the lab in header
   */
  public delete(labInfo: CnExternalApiInfo, route: string, classReference?: ClDeserializationRef,
                options: BlExternalApiHttpOption = {}): Observable<any> {
    return this.apiService.delete(this.constructRoute(labInfo.apiUrl, route),
      classReference, this.getRequestOptions(labInfo.apiKey, options));
  }

  /**
   * Make a http GET with the ip of the lab and the API key of the lab in header
   */
  public get(labInfo: CnExternalApiInfo, route: string, classReference?: ClDeserializationRef,
             options: BlExternalApiHttpOption = {}): Observable<any> {
    return this.apiService.get(this.constructRoute(labInfo.apiUrl, route),
      classReference, this.getRequestOptions(labInfo.apiKey, options));
  }

  private constructRoute(labUrl: string, route: string): string {
    return `${labUrl}/${this.baseApiRoute}/${route}`;
  }


  // get the axios request config with the api key in the header
  private getRequestOptions(apiKey: string, options: BlExternalApiHttpOption): BlExternalApiHttpOption {
    return Object.assign(options, {headers: this.getHeader(apiKey)});
  }

  // get the header with api key
  private getHeader(apiKey: string): any {
    const header: any = {};
    header[cnExternalLabApiKeyHeader] = `${cnExternalLabApiKeySchema} ${apiKey}`;

    // add the user id if this is a connected route
    const user = CnCurrentUserHelper.getCurrentUser();
    if (user) {
      header[cnExternalLabUserHeader] = user.id;
    }
    return header;
  }
}
