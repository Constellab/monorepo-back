import { BlExternalApiHttpOption, BlExternalApiService } from '@monorepo/back-core-lib';
import { ClDeserializationRef } from '@monorepo/core-lib';
import { Injectable } from '@nestjs/common';
import { lastValueFrom, Observable } from 'rxjs';

import {
  CN_EXTERNAL_LAB_API_KEY_HEADER,
  CN_EXTERNAL_LAB_API_KEY_SCHEMA,
  CN_EXTERNAL_LAB_USER_HEADER,
  CnExternalApiInfo,
} from '../cn-core/model/config/cn-config.class';
import { CnCurrentUserHelper } from '../cn-core/utils/cn-current-user.helper';
import { cnApplyIpOverride } from './cn-external-api-ip-override.helper';
import { CnLabGlobalActivity } from './model/cn-external-lab-api.class';

/**
 * Service to call the api of a lab
 */
@Injectable()
export class CnExternalLabApiService {
  constructor(private apiService: BlExternalApiService) {}

  public async healthCheck(labInfo: CnExternalApiInfo): Promise<boolean> {
    return lastValueFrom(this.get(labInfo, `health-check`, undefined, { logError: false, timeout: 2500 }))
      .then(() => true)
      .catch(() => false);
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
  public post(
    labInfo: CnExternalApiInfo,
    route: string,
    body: any,
    classReference?: ClDeserializationRef,
    options: BlExternalApiHttpOption = {}
  ): Observable<any> {
    const requestOptions = this.getRequestOptions(labInfo, options);
    return this.apiService.post(
      this.buildUrl(labInfo, route, requestOptions),
      body,
      classReference,
      requestOptions
    );
  }

  /**
   * Make a http put with the ip of the lab and the API key of the lab in header
   */
  public put(
    labInfo: CnExternalApiInfo,
    route: string,
    body: any,
    classReference?: ClDeserializationRef,
    options: BlExternalApiHttpOption = {}
  ): Observable<any> {
    const requestOptions = this.getRequestOptions(labInfo, options);
    return this.apiService.put(
      this.buildUrl(labInfo, route, requestOptions),
      body,
      classReference,
      requestOptions
    );
  }

  /**
   * Make a http put with the ip of the lab and the API key of the lab in header
   */
  public delete(
    labInfo: CnExternalApiInfo,
    route: string,
    classReference?: ClDeserializationRef,
    options: BlExternalApiHttpOption = {}
  ): Observable<any> {
    const requestOptions = this.getRequestOptions(labInfo, options);
    return this.apiService.delete(
      this.buildUrl(labInfo, route, requestOptions),
      classReference,
      requestOptions
    );
  }

  /**
   * Make a http GET with the ip of the lab and the API key of the lab in header
   */
  public get(
    labInfo: CnExternalApiInfo,
    route: string,
    classReference?: ClDeserializationRef,
    options: BlExternalApiHttpOption = {}
  ): Observable<any> {
    const requestOptions = this.getRequestOptions(labInfo, options);
    return this.apiService.get(this.buildUrl(labInfo, route, requestOptions), classReference, requestOptions);
  }

  // build the target url for the route, redirecting to the ip override (and
  // enriching the options with the Host header / SNI) for on-premise labs
  private buildUrl(labInfo: CnExternalApiInfo, route: string, options: BlExternalApiHttpOption): string {
    return cnApplyIpOverride(`${labInfo.apiUrl}/${route}`, labInfo.ipOverride, options);
  }

  // get the axios request config with the api key in the header
  private getRequestOptions(
    labInfo: CnExternalApiInfo,
    options: BlExternalApiHttpOption
  ): BlExternalApiHttpOption {
    Object.assign(options, { headers: this.getHeader(labInfo.apiKey) });
    return options;
  }

  // get the header with api key
  private getHeader(apiKey: string): any {
    const header: any = {};
    header[CN_EXTERNAL_LAB_API_KEY_HEADER] = `${CN_EXTERNAL_LAB_API_KEY_SCHEMA} ${apiKey}`;

    // add the user id if this is a connected route
    const user = CnCurrentUserHelper.getCurrentUser();
    if (user) {
      header[CN_EXTERNAL_LAB_USER_HEADER] = user.id;
    }
    return header;
  }
}
