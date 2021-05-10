import {Injectable} from '@nestjs/common';
import {Observable} from 'rxjs';
import {LabServerInfo} from '../core/model/config/lab-server-info.class';
import {externalLabApiKeyHeader, externalLabApiKeySchema} from '../core/model/config/external-lab.class';
import {ExternalApiService} from '../core/services/external-api/external-api.service';
import {ClDeserializationRef} from '@monorepo/core-lib';
import {ExternalApiHttpOption} from '../core/services/external-api/external-api.class';

/**
 * Service to call the api of a lab
 */
@Injectable()
export class ExternalLabApiService {

  private readonly baseApiRoute: string = 'central-api/';

  constructor(private apiService: ExternalApiService) {
  }

  /**
   * Make an http post with the ip of the lab and the API key of the lab in header
   */
  public post(labInfo: LabServerInfo, route: string, body: any, classReference?: ClDeserializationRef,
              options: ExternalApiHttpOption = {}): Observable<any> {
    return this.apiService.post(this.constructRoute(labInfo.apiUrl, route), body,
      classReference, this.getRequestOptions(labInfo.apiKey, options));
  }

  /**
   * Make an http put with the ip of the lab and the API key of the lab in header
   */
  public put(labInfo: LabServerInfo, route: string, body: any, classReference?: ClDeserializationRef,
             options: ExternalApiHttpOption = {}): Observable<any> {
    return this.apiService.put(this.constructRoute(labInfo.apiUrl, route), body,
      classReference, this.getRequestOptions(labInfo.apiKey, options));
  }

  /**
   * Make an http GET with the ip of the lab and the API key of the lab in header
   */
  public get(labInfo: LabServerInfo, route: string, classReference?: ClDeserializationRef,
             options: ExternalApiHttpOption = {}): Observable<any> {
    return this.apiService.get(this.constructRoute(labInfo.apiUrl, route),
      classReference, this.getRequestOptions(labInfo.apiKey, options));
  }

  private constructRoute(labUrl: string, route: string): string {
    return `${labUrl}${this.baseApiRoute}${route}`;
  }


  // get the axios request config with the api key in the header
  private getRequestOptions(apiKey: string, options: ExternalApiHttpOption): ExternalApiHttpOption {
    return Object.assign(options, {headers: this.getHeader(apiKey)});
  }

  // get the header with api key
  private getHeader(apiKey: string): any {
    const header: any = {};
    header[externalLabApiKeyHeader] = `${externalLabApiKeySchema} ${apiKey}`;
    return header;
  }
}
