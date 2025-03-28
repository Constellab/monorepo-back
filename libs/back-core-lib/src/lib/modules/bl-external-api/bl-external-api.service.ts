import { Injectable, Logger } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  BlExternalApiError,
  BlExternalApiHttpOption,
  BlExternalApiHttpOptionObserve,
} from './bl-external-api.class';
import { ClCoreJsonConvert, ClDeserializationRef, ClPageI } from '@monorepo/core-lib';
import { BlExternalApiErrorService } from './bl-external-api-error.service';
import { AxiosError, AxiosResponse } from 'axios';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class BlExternalApiService {
  constructor(
    private httpService: HttpService,
    private errorService: BlExternalApiErrorService
  ) {}

  /**
   * HTTP POST. Call a post request.
   * @param route the route for the api call
   * @param body object to post
   * @param classReference if not null the response is converted to the classReference
   * @param options custom http options
   */
  public post(
    route: string,
    body: any,
    classReference?: ClDeserializationRef,
    options: BlExternalApiHttpOption = {}
  ): Observable<any> {
    return this.httpService.post(route, this.convertObjectToPlain(body), options as any).pipe(
      map((result) =>
        this.deserialize(result as any, classReference, options.observe, options.resultIsPaginated)
      ),
      catchError((err) => this.catchError(err, route, options.logError))
    );
  }

  /**
   * HTTP PUT. Call a put request
   * @param route the route for the api call
   * @param body object to update
   * @param classReference if not null the response is converted to the classReference
   * @param options custom http options
   */
  public put(
    route: string,
    body: any,
    classReference?: ClDeserializationRef,
    options: BlExternalApiHttpOption = {}
  ): Observable<any> {
    return this.httpService.put(route, this.convertObjectToPlain(body), options as any).pipe(
      map((result) =>
        this.deserialize(result as any, classReference, options.observe, options.resultIsPaginated)
      ),
      catchError((err) => this.catchError(err, route, options.logError))
    );
  }

  /**
   * HTTP DELETE. Call a delete request.
   * @param route the route for the api call
   * @param classReference if not null the response is converted to the classReference
   * @param options custom http options
   */
  public delete(
    route: string,
    classReference?: ClDeserializationRef,
    options: BlExternalApiHttpOption = {}
  ): Observable<any> {
    return this.httpService.delete(route, options as any).pipe(
      map((result) =>
        this.deserialize(result as any, classReference, options.observe, options.resultIsPaginated)
      ),
      catchError((err) => this.catchError(err, route, options.logError))
    );
  }

  /**
   * HTTP GET. Basic get request.
   * @param route the route for the api call
   * @param classReference if not null the response is converted to the classReference
   * @param options custom http options
   */
  public get(
    route: string,
    classReference?: ClDeserializationRef,
    options: BlExternalApiHttpOption = {}
  ): Observable<any> {
    return this.httpService.get(route, options as any).pipe(
      map((result) =>
        this.deserialize(result as any, classReference, options.observe, options.resultIsPaginated)
      ),
      catchError((err) => this.catchError(err, route, options.logError))
    );
  }

  /**
   * Make an http post with form data with the ip of the lab and the API key of the lab in header
   */
  public postFormData(
    route: string,
    formData: any,
    classReference?: ClDeserializationRef,
    options: BlExternalApiHttpOption = {}
  ): Observable<any> {
    // add the formData header
    options.headers = Object.assign({}, options.headers, formData.getHeaders());

    return this.post(route, formData.getBuffer(), classReference, options).pipe(
      catchError((err) => this.catchError(err, route, options.logError))
    );
  }

  /**
   * Deserialize an object or array using json converter package if the input are not null
   * @param response
   * @param classReference class reference of object
   * @param observe
   * @param isPaginated if true the result is considered as a {@link ClPageI}
   */
  public deserialize(
    response: AxiosResponse,
    classReference: ClDeserializationRef,
    observe: BlExternalApiHttpOptionObserve = 'data',
    isPaginated: boolean = false
  ): any {
    if (observe === 'response') {
      return response;
    }

    if (response.data && classReference) {
      try {
        if (isPaginated) {
          // deserialize page
          return this.deserializePage(response.data, classReference);
        } else {
          return ClCoreJsonConvert.deserialize(response.data, classReference);
        }
      } catch (e) {
        this.errorService.handleDeserializationError(e, classReference);
      }
    } else {
      return response.data;
    }
  }

  private deserializePage(json: any, classReference: ClDeserializationRef): ClPageI<any> {
    // if the result is paginated (we supposed the json is type of ClPage)
    if (json.data != null && json.data instanceof Array) {
      return {
        first: json.paginator.is_first_page,
        last: json.paginator.is_last_page,
        currentPage: json.paginator.page,
        pageSize: json.paginator.number_of_items_per_page,
        totalElements: json.paginator.number_of_items,
        objects: ClCoreJsonConvert.deserialize(json.data, classReference),
      };
    } else {
      console.error('Response object not paginated');
      throw 'Response object not paginated';
    }
  }

  private catchError(error: AxiosError, route: string, logError?: boolean): Observable<never> {
    const apiError: BlExternalApiError = {
      status: error.response ? error.response.status : null,
      message: error.message ?? '',
      error: error,
    };

    const errorData: any = error.response?.data ?? {};
    // If the error is formatted like : CmNestApiError
    if (
      errorData &&
      errorData.status != null &&
      errorData.code != null &&
      errorData.detail != null &&
      (errorData.instanceId != null || errorData.instance_id != null)
    ) {
      apiError.knownError = {
        status: errorData.status,
        code: errorData.code,
        detail: errorData.detail,
        instanceId: errorData.instanceId ?? errorData.instance_id,
      };
      apiError.message = errorData.detail;
    }

    // log if log error is not set to false (default is true)
    if (logError !== false) {
      if (apiError.message) {
        Logger.error(`[BLApiService] Error during call to route '${route}' : ${apiError.message}`);
      } else {
        Logger.error(`[BLApiService] Error during call to route '${route}'`);
      }
    }
    return throwError(() => apiError);
  }

  /**
   * Convert the classes or object to plain json object
   * @param object
   * @private
   */
  private convertObjectToPlain(object: any): any {
    return ClCoreJsonConvert.instanceToPlain(object);
  }
}
