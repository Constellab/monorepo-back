import {Injectable} from '@nestjs/common';
import {Observable} from 'rxjs';
import {ClDeserializationRef} from '@monorepo/core-lib';
import {BlExternalApiHttpOption, BlExternalApiService} from '@monorepo/back-core-lib';
import {
  CnExternalApiInfo,
  cnExternalLabApiKeyHeader,
  cnExternalLabApiKeySchema
} from '../cn-core/model/config/cn-config.class';

/**
 * Service to call the api of a lab
 */
@Injectable()
export class CnExternalLabApiService {

  private readonly baseApiRoute: string = 'central-api';

  constructor(private apiService: BlExternalApiService) {
  }

  public async healthCheck(labInfo: CnExternalApiInfo): Promise<boolean>{
    return this.get( labInfo,`health-check`).toPromise();
  }

  public async getSettings(labInfo: CnExternalApiInfo): Promise<any>{
    return this.get(labInfo, `settings`).toPromise();
  }

  /**
   * Make an http post with the ip of the lab and the API key of the lab in header
   */
  public post(labInfo: CnExternalApiInfo, route: string, body: any, classReference?: ClDeserializationRef,
              options: BlExternalApiHttpOption = {}): Observable<any> {
    return this.apiService.post(this.constructRoute('http://localhost:3000', route), body,
      classReference, this.getRequestOptions(labInfo.apiKey, options));
  }

  /**
   * Make an http put with the ip of the lab and the API key of the lab in header
   */
  public put(labInfo: CnExternalApiInfo, route: string, body: any, classReference?: ClDeserializationRef,
             options: BlExternalApiHttpOption = {}): Observable<any> {
    return this.apiService.put(this.constructRoute(labInfo.apiUrl, route), body,
      classReference, this.getRequestOptions(labInfo.apiKey, options));
  }

  /**
   * Make an http GET with the ip of the lab and the API key of the lab in header
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
    return header;
  }
}
