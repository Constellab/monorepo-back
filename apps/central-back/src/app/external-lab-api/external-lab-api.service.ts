import {HttpService, Injectable} from '@nestjs/common';
import {Observable} from 'rxjs';
import {AxiosRequestConfig} from 'axios';
import {LabServerInfo} from '../core/model/config/lab-server-info.class';
import {externalLabApiKeyHeader, externalLabApiKeySchema} from '../core/model/config/external-lab.class';
import {map} from 'rxjs/operators';
import {ExternalLabApiResponse} from './external-lab-api.class';

/**
 * Service to call the api of a lab
 */
@Injectable()
export class ExternalLabApiService {

  private readonly baseApiRoute: string = 'central-api/';

  constructor(private httpService: HttpService) {
  }

  /**
   * Make an http post with the ip of the lab and the API key of the lab in header
   */
  public post(labInfo: LabServerInfo, route: string, body: any): Observable<any> {
    return this.httpService.post(this.constructRoute(labInfo.apiUrl, route), body, this.getRequestConfig(labInfo.apiKey)).pipe(
      map(response => response.data)
    );
  }

  /**
   * Make an http put with the ip of the lab and the API key of the lab in header
   */
  public put(labInfo: LabServerInfo, route: string, body: any): Observable<any> {
    return this.httpService.put(this.constructRoute(labInfo.apiUrl, route), body, this.getRequestConfig(labInfo.apiKey)).pipe(
      map(response => response.data)
    );
  }

  /**
   * Make an http post with the ip of the lab and the API key of the lab in header
   * Get response of type ExternalLabApiResponse, check the status and return the response if status is true
   */
  public postStatusResponse(labInfo: LabServerInfo, route: string, body: any): Observable<any> {
    return this.post(labInfo, route, body).pipe(
      map((response: ExternalLabApiResponse) => this.handleExternalLabApiResponse(response))
    );
  }


  /**
   * Make an http put with the ip of the lab and the API key of the lab in header
   * Get response of type ExternalLabApiResponse, check the status and return the response if status is true
   */
  public putStatusResponse(labInfo: LabServerInfo, route: string, body: any): Observable<any> {
    return this.put(labInfo, route, body).pipe(
      map((response: ExternalLabApiResponse) => this.handleExternalLabApiResponse(response))
    );
  }

  /**
   * Make an http post with form data with the ip of the lab and the API key of the lab in header
   */
  public postFormData(labInfo: LabServerInfo, route: string, formData: any): Observable<any> {
    const requestConfig: AxiosRequestConfig = this.getRequestConfig(labInfo.apiKey);

    // add the formData header
    requestConfig.headers = Object.assign(requestConfig.headers, formData.getHeaders());

    return this.httpService.post(this.constructRoute(labInfo.apiUrl, route), formData.getBuffer(),
      {headers: formData.getHeaders()}).pipe(
      map(response => response.data)
    );
  }

  private constructRoute(labUrl: string, route: string): string {
    return `${labUrl}${this.baseApiRoute}${route}`;
  }


  // For ExternalLabApiResponse, check the status and return response
  private handleExternalLabApiResponse(response: ExternalLabApiResponse): any {
    if (response.status === false) {
      throw new Error(response.response);
    }
    return response.response;
  }


  // get the axios request config with the api key in the header
  private getRequestConfig(apiKey: string): AxiosRequestConfig {
    return {headers: this.getHeader(apiKey)};
  }

  // get the header with api key
  private getHeader(apiKey: string): any {
    const header: any = {};
    header[externalLabApiKeyHeader] = `${externalLabApiKeySchema} ${apiKey}`;
    return header;
  }
}
