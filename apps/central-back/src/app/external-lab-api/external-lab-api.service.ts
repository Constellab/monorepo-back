import {Injectable} from '@nestjs/common';
import {Observable} from 'rxjs';
import {LabServerInfo} from '../core/model/config/lab-server-info.class';
import {externalLabApiKeyHeader, externalLabApiKeySchema} from '../core/model/config/external-lab.class';
import {ClDeserializationRef} from '@monorepo/core-lib';
import {BlExternalApiHttpOption, BlExternalApiService} from '@monorepo/back-core-lib';

/**
 * Service to call the api of a lab
 */
@Injectable()
export class ExternalLabApiService {

  private readonly baseApiRoute: string = 'central-api/';

  constructor(private apiService: BlExternalApiService) {
  }

  /**
   * Make an http post with the ip of the lab and the API key of the lab in header
   */
  public post(labInfo: LabServerInfo, route: string, body: any, classReference?: ClDeserializationRef,
              options: BlExternalApiHttpOption = {}): Observable<any> {
    return this.apiService.post(this.constructRoute(labInfo.apiUrl, route), body,
      classReference, this.getRequestOptions(labInfo.apiKey, options));
  }

  /**
   * Make an http put with the ip of the lab and the API key of the lab in header
   */
  public put(labInfo: LabServerInfo, route: string, body: any, classReference?: ClDeserializationRef,
             options: BlExternalApiHttpOption = {}): Observable<any> {
    return this.apiService.put(this.constructRoute(labInfo.apiUrl, route), body,
      classReference, this.getRequestOptions(labInfo.apiKey, options));
  }

  /**
   * Make an http GET with the ip of the lab and the API key of the lab in header
   */
  public get(labInfo: LabServerInfo, route: string, classReference?: ClDeserializationRef,
             options: BlExternalApiHttpOption = {}): Observable<any> {
    return this.apiService.get(this.constructRoute(labInfo.apiUrl, route),
      classReference, this.getRequestOptions(labInfo.apiKey, options));
  }

  private constructRoute(labUrl: string, route: string): string {
    return `${labUrl}${this.baseApiRoute}${route}`;
  }


  // get the axios request config with the api key in the header
  private getRequestOptions(apiKey: string, options: BlExternalApiHttpOption): BlExternalApiHttpOption {
    return Object.assign(options, {headers: this.getHeader(apiKey)});
  }

  // get the header with api key
  private getHeader(apiKey: string): any {
    const header: any = {};
    header[externalLabApiKeyHeader] = `${externalLabApiKeySchema} ${apiKey}`;
    return header;
  }
}
