import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import {catchError, map, mergeMap, tap} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {ClCoreJsonConvert, ClDeserializationRef} from '@monorepo/core-lib';
import {FlHttpGetUrlOption, FlHttpOption, FlHttpOptionSerialization} from '../model/fl-http-option.class';
import {FlFileHelper} from '../../../service/fl-file.helper';
import {FlApiServiceConfig} from './fl-api-service.config';
import {FlApiErrorService} from './fl-api-error.service';

/**
 * Global service to call make Http request. This service formats input and output
 * and handles errors
 */
@Injectable()
export class FlApiService {

  constructor(protected http: HttpClient,
              private configService: FlApiServiceConfig,
              private flErrorService: FlApiErrorService) {
  }

  /**
   * HTTP GET. Get a single element with the id.
   * @param route the route for the api call
   * @param id of the object to get. The id is added to at the end of the request with a '/'.
   * Can be add²  ed in the anywhere in the request with the string '\{id\}'
   * @param classReference if not null the response is converted to the classReference
   * @param options custom http options
   */
  public getById(route: string, id: string, classReference?: ClDeserializationRef,
                 options: FlHttpOption = {}): Observable<any> {

    options.headers = this.mergeHeader(options.headers);
    return this.http.get(this.getUrlForId(route, id, options.overrideApiUrl), options).pipe(
      catchError(err => this.catchError(err, options)),
      map(result => this.deserialize(result, classReference, options.resultIsPaginated))
    );
  }

  /**
   * HTTP GET. Basic get request.
   * @param route the route for the api call
   * @param classReference if not null the response is converted to the classReference
   * @param options custom http options
   */
  public get(route: string, classReference?: ClDeserializationRef,
             options: FlHttpOption = {}): Observable<any> {
    options.headers = this.mergeHeader(options.headers);
    return this.http.get(this.getUrl(route, options), options).pipe(
      catchError(err => this.catchError(err, options)),
      map(result => this.deserialize(result, classReference, options.resultIsPaginated))
    );
  }

  /**
   * HTTP PUT. Call a put request
   * @param route the route for the api call
   * @param body object to update
   * @param classReference if not null the response is converted to the classReference
   * @param options custom http options
   */
  public put(route: string, body: any, classReference?: ClDeserializationRef,
             options: FlHttpOption = {}): Observable<any> {
    options.headers = this.mergeHeader(options.headers);
    return this.http.put(
      this.getUrl(route, options),
      this.convertObjectToPlain(body, options.serialization),
      options
    ).pipe(
      catchError(err => this.catchError(err, options)),
      map(result => this.deserialize(result, classReference, options.resultIsPaginated))
    );
  }

  /**
   * HTTP PATCH. Call a patch request
   * @param route the route for the api call
   * @param body object to patch
   * @param classReference if not null the response is converted to the classReference
   * @param options custom http options
   */
  public patch(route: string, body: any, classReference?: ClDeserializationRef,
               options: FlHttpOption = {}): Observable<any> {
    options.headers = this.mergeHeader(options.headers);
    return this.http.patch(
      this.getUrl(route, options),
      this.convertObjectToPlain(body, options.serialization),
      options
    ).pipe(
      catchError(err => this.catchError(err, options)),
      map(result => this.deserialize(result, classReference, options.resultIsPaginated))
    );
  }

  /**
   * HTTP POST. Call a post request.
   * @param route the route for the api call
   * @param body object to post
   * @param classReference if not null the response is converted to the classReference
   * @param options custom http options
   */
  public post(route: string, body: any, classReference?: ClDeserializationRef,
              options: FlHttpOption = {}): Observable<any> {
    options.headers = this.mergeHeader(options.headers);
    return this.http.post(
      this.getUrl(route, options),
      this.convertObjectToPlain(body, options.serialization),
      options
    ).pipe(
      catchError(err => this.catchError(err, options)),
      map(result => this.deserialize(result, classReference, options.resultIsPaginated))
    );
  }

  /**
   * HTTP DELETE. Call a delete request.
   * @param route the route for the api call
   * @param id of the object to delete. The id is added to at the end of the request with a '/'.
   * Can be added in the anywhere in the request with the string '\{id\}'
   * @param classReference if not null the response is converted to the classReference
   * @param options custom http options
   */
  public deleteById(route: string, id: string, classReference?: ClDeserializationRef,
                    options: FlHttpOption = {}): Observable<any> {
    options.headers = this.mergeHeader(options.headers);
    return this.http.delete(this.getUrlForId(route, id, options.overrideApiUrl), options).pipe(
      catchError(err => this.catchError(err, options)),
      map(result => this.deserialize(result, classReference, options.resultIsPaginated))
    );
  }

  /**
   * HTTP DELETE. Call a delete request.
   * @param route the route for the api call
   * @param classReference if not null the response is converted to the classReference
   * @param options custom http options
   */
  public delete(route: string, classReference?: ClDeserializationRef,
                options: FlHttpOption = {}): Observable<any> {
    options.headers = this.mergeHeader(options.headers);
    return this.http.delete(this.getUrl(route, options), options).pipe(
      catchError(err => this.catchError(err, options)),
      map(result => this.deserialize(result, classReference, options.resultIsPaginated))
    );
  }

  /**
   * Call HTTP Get request that returns a file.
   * @param route the route for the api call
   * @param filename name of the file of direct download is true
   * @param directDownload if true, the file is directly downloaded on users' computer
   * @param options custom http options
   */
  public downloadFile(route: string, filename ?: string,
                      directDownload: boolean = true,
                      options: FlHttpOption = {}): Observable<Blob> {
    options.headers = this.mergeHeader(options.headers);
    options.responseType = 'blob';
    return this.http.get(
      this.getUrl(route),
      options
    ).pipe(
      tap(file => this.downloadFileSuccess(file as Blob, filename, directDownload)),
      catchError(err => this.catchError(err, options)),
    ) as Observable<Blob>;
  }


  /**
   * Call HTTP Post request that returns a file.
   * @param route the route for the api call
   * @param body object to post
   * @param filename name of the file of direct download is true
   * @param directDownload if true, the file is directly downloaded on users' computer
   * @param options custom http options
   */
  public downloadFilePost(route: string, body: any, filename ?: string,
                          directDownload: boolean = true,
                          options: FlHttpOption = {}): Observable<Blob> {
    options.headers = this.mergeHeader(options.headers);
    options.responseType = 'blob';
    return this.http.post(
      this.getUrl(route),
      this.convertObjectToPlain(body),
      options
    ).pipe(
      tap(file => this.downloadFileSuccess(file as Blob, filename, directDownload)),
      catchError(err => this.catchError(err, options)),
    ) as Observable<Blob>;
  }

  /**
   * Deserialize an object or array using json converter package if the input are not null
   * @param json json object
   * @param classReference class reference of object
   * @param isPaginated if true the result is considered as a {@link ClPage}
   */
  public deserialize(json: any, classReference: ClDeserializationRef, isPaginated: boolean = false): any {
    if (json && classReference) {

      try {
        if (isPaginated) {
          // deserialize page
          return this.configService.deserializePage(json, classReference);
        } else {
          return ClCoreJsonConvert.deserialize(json, classReference);
        }
      } catch (e) {
        this.flErrorService.handleDeserializationError(e, classReference);
      }
    } else {
      return json;
    }
  }

  /**
   * Construct the url to call with the route and pagination if enable
   * @param route the route of the api to call
   * @param options
   */
  protected getUrl(route: string, options: FlHttpGetUrlOption = {}): string {
    let fullRoute = this.getBaseRouteUrl(route, options.overrideApiUrl);

    // manage the pagination
    if (options.page != null || options.pageSize != null) {
      let firstCharacter: string;

      // check if there are already some url parameters
      if (route.search('\\?') !== -1) {
        firstCharacter = '&';
      } else {
        firstCharacter = '?';
      }

      // add the page parameter
      if (options.page != null) {
        fullRoute += `${firstCharacter}${this.configService.pageQueryParam}=${options.page}`;
        firstCharacter = '&';
      }
      // add the size parameter
      if (options.pageSize != null) {
        fullRoute += `${firstCharacter}${this.configService.pageSizeQueryParam}=${options.pageSize}`;
      }

    }
    return fullRoute;
  }

  /**
   * Construct the url to call for a get single or a delete which use an id
   *
   * The id is added at the end of the url with a '/'. If the route contains the string '\{id\}'
   * the object id will replace it
   * @param route the route of the api to call
   * @param id the id of the object to get or delete
   * @param overrideApiUrl if provided it overrides the base url
   */
  public getUrlForId(route: string, id: string, overrideApiUrl?: string): string {
    const fullRoute = this.getBaseRouteUrl(route, overrideApiUrl);
    // is the route contain {id} we replace it with the id
    if (fullRoute.search('{id}') !== -1) {
      return fullRoute.replace('{id}', id.toString());
    }
    // otherwise we put it at the end
    else {
      return fullRoute + '/' + id;
    }
  }

  /**
   * Get the base route for the call
   * @param route
   * @param overrideApiUrl
   * @private
   */
  public getBaseRouteUrl(route: string, overrideApiUrl?: string): string {
    return (overrideApiUrl == null ? this.configService.getApiUrl() : overrideApiUrl) + route;
  }


  // download the file to the user's computer is direct download is set to true
  private downloadFileSuccess(file: Blob, filename: string, directDownload: boolean): void {
    if (directDownload) {
      FlFileHelper.downloadBlob(file, filename);
    }
  }

  // Merge the header of the request with the header of the config
  private mergeHeader(headers: HttpHeaders): HttpHeaders | null {
    const headerObject: Record<string, string> = this.getConfigHeader();

    if (headers != null) {
      // append the header of the request
      headers.keys().map(key => headers[key] = headers.get(key));
    }

    if (Object.keys(headerObject).length === 0) return null;

    return new HttpHeaders(headerObject);
  }

  private getConfigHeader(): Record<string, string> {
    return this.configService.getHeaders() ?? {};
  }

  private catchError(errorResponse: HttpErrorResponse, httpOptions: FlHttpOption = {}): Observable<never> {
    if (httpOptions.responseType === 'blob') {
      return this.catchBlobError(errorResponse, httpOptions);
    } else {
      return this.callHandleServerError(errorResponse, httpOptions);
    }
  }

  /**
   * Method to handle blob error. We need a specific method because the error object of the response if also a blob
   */
  private catchBlobError(response: HttpErrorResponse, options: FlHttpOption): Observable<never> {
    // read the error from the blob response
    return FlFileHelper.readBlobContent(response.error, true).pipe(
      // create an new HttpErrorResponse object with the error from the blob
      mergeMap((error: any) => this.callHandleServerError(Object.assign({}, response, {error: error}), options))
    );
  }

  private callHandleServerError(errorResponse: HttpErrorResponse, httpOptions: FlHttpOption = {}): Observable<never> {
    return this.flErrorService.handleServerError(errorResponse, httpOptions.hideSnackBarError,
      httpOptions.errorSnackBarDuration, httpOptions.defaultError);
  }

  /**
   * Convert the classes or object to plain json object
   */
  private convertObjectToPlain(object: any, serializationOption: FlHttpOptionSerialization = 'classToPlain'): any {
    if (object instanceof FormData || serializationOption === 'none') {
      return object;
    }

    try {
      // if a class was provided for the serialization
      if (typeof serializationOption === 'function') {
        return ClCoreJsonConvert.classToPlain(object, serializationOption);
      } else if (serializationOption === 'classToPlain') {
        return ClCoreJsonConvert.classToPlain(object);
      } else {
        return JSON.stringify(object);
      }

    } catch (e) {
      console.error('Error while serializing object before api call', object);
      throw e;
    }
  }

  /**
   * Simple method to convert a json object to url param like 'lastname=test&firstname=bob'
   * @param record
   * @private
   */
  public convertRecordToURLParams(record: Record<string, any>): string {
    const params = new URLSearchParams();
    for (const key in record) {
      if (record[key] != null) {
        params.set(key, record[key]);
      }
    }
    return params.toString();
  }
}
