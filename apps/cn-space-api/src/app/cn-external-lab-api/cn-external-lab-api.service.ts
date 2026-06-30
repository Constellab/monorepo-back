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
    return lastValueFrom(this.get(labInfo, `health-check`, null, { logError: false, timeout: 2500 }))
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
    return this.apiService.post(
      this.constructRoute(labInfo.apiUrl, route),
      body,
      classReference,
      this.getRequestOptions(labInfo, options)
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
    return this.apiService.put(
      this.constructRoute(labInfo.apiUrl, route),
      body,
      classReference,
      this.getRequestOptions(labInfo, options)
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
    return this.apiService.delete(
      this.constructRoute(labInfo.apiUrl, route),
      classReference,
      this.getRequestOptions(labInfo, options)
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
    return this.apiService.get(
      this.constructRoute(labInfo.apiUrl, route),
      classReference,
      this.getRequestOptions(labInfo, options)
    );
  }

  private constructRoute(labUrl: string, route: string): string {
    return `${labUrl}/${route}`;
  }

  // get the axios request config with the api key in the header, and a custom
  // DNS resolution agent when the lab defines an ip override (on-premise labs)
  private getRequestOptions(
    labInfo: CnExternalApiInfo,
    options: BlExternalApiHttpOption
  ): BlExternalApiHttpOption {
    Object.assign(options, { headers: this.getHeader(labInfo.apiKey) });
    return cnApplyIpOverride(labInfo.ipOverride, options);
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
