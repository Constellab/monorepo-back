import {Inject, Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {catchError, map, tap} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {ClCoreJsonConvert, ClDeserializationRef} from '@monorepo/core-lib';
import {FL_API_MODULE_CONFIG, FlApiErrorService, FlApiModuleConfig} from '../model/fl-api-module.config.class';
import {FlFileService} from '../../../service/fl-file.service';
import {FlHttpGetUrlOption, FlHttpOption} from '../model/fl-http-option.class';

/**
 * Global service to call make Http request. This service formats input and output
 * and handles errors
 */
@Injectable()
export class FlApiService {
  private readonly apiUrl: string;

  constructor(protected http: HttpClient,
              @Inject(FL_API_MODULE_CONFIG) private config: FlApiModuleConfig,
              private fileService: FlFileService,
              private flErrorService: FlApiErrorService) {
    // get the api url from the config
    this.apiUrl = config.apiUrl;
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
    return this.http.put(this.getUrl(route, options), body, options).pipe(
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
    return this.http.patch(this.getUrl(route, options), body, options).pipe(
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
    return this.http.post(this.getUrl(route, options), body, options).pipe(
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
   */
  public downloadFile(route: string, filename ?: string,
                      directDownload: boolean = true): Observable<Blob> {
    return this.http.get(this.getUrl(route), {responseType: 'blob'}).pipe(
      tap(file => this.downloadFileSuccess(file, filename, directDownload)),
      catchError(err => this.catchError(err)),
    ) as Observable<Blob>;
  }

  /**
   * Call HTTP Post request that returns a file.
   * @param route the route for the api call
   * @param body object to post
   * @param filename name of the file of direct download is true
   * @param directDownload if true, the file is directly downloaded on users' computer
   */
  public downloadFilePost(route: string, body: any, filename ?: string,
                          directDownload: boolean = true): Observable<Blob> {
    return this.http.post(this.getUrl(route), body, {responseType: 'blob'}).pipe(
      tap(file => this.downloadFileSuccess(file, filename, directDownload)),
      catchError(err => this.catchError(err)),
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
          return this.config.pagination.deserializePage(json, classReference);
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
        fullRoute += `${firstCharacter}${this.config.pagination.pageQueryParam}=${options.page}`;
        firstCharacter = '&';
      }
      // add the size parameter
      if (options.pageSize != null) {
        fullRoute += `${firstCharacter}${this.config.pagination.pageSizeQueryParam}=${options.pageSize}`;
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
  protected getUrlForId(route: string, id: string, overrideApiUrl?: string): string {
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
  private getBaseRouteUrl(route: string, overrideApiUrl?: string): string {
    return (overrideApiUrl == null ? this.apiUrl : overrideApiUrl) + route;
  }

  // download the file to the user's computer is direct download is set to true
  private downloadFileSuccess(file: Blob, filename: string, directDownload: boolean): void {
    if (directDownload) {
      this.fileService.downloadBlob(file, filename);
    }
  }

  private catchError(error: HttpErrorResponse, httpOptions: FlHttpOption = {}): Observable<never> {
    return this.flErrorService.handleServerError(error, httpOptions.hideSnackBarError,
      httpOptions.errorSnackBarDuration, httpOptions.defaultError);
  }
}
