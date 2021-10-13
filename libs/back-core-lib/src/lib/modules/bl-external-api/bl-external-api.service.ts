import {HttpService, Injectable} from '@nestjs/common';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {BlExternalApiHttpOption, BlExternalApiHttpOptionObserve} from './bl-external-api.class';
import {ClCoreJsonConvert, ClDeserializationRef, ClPageI} from '@monorepo/core-lib';
import {BlExternalApiErrorService} from './bl-external-api-error.service';
import {AxiosResponse} from 'axios';

@Injectable()
export class BlExternalApiService {


  constructor(private httpService: HttpService,
              private errorService: BlExternalApiErrorService) {
  }

  /**
   * HTTP POST. Call a post request.
   * @param route the route for the api call
   * @param body object to post
   * @param classReference if not null the response is converted to the classReference
   * @param options custom http options
   */
  public post(route: string, body: any, classReference?: ClDeserializationRef,
              options: BlExternalApiHttpOption = {}): Observable<any> {
    return this.httpService.post(route, this.convertObjectToPlain(body), options).pipe(
      map(result => this.deserialize(result as any, classReference, options.observe, options.resultIsPaginated))
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
             options: BlExternalApiHttpOption = {}): Observable<any> {
    return this.httpService.put(route, this.convertObjectToPlain(body), options).pipe(
      map(result => this.deserialize(result as any, classReference, options.observe, options.resultIsPaginated))
    );
  }

  /**
   * HTTP DELETE. Call a delete request.
   * @param route the route for the api call
   * @param classReference if not null the response is converted to the classReference
   * @param options custom http options
   */
  public delete(route: string, classReference?: ClDeserializationRef,
                options: BlExternalApiHttpOption = {}): Observable<any> {
    return this.httpService.delete(route, options).pipe(
      map(result => this.deserialize(result as any, classReference, options.observe, options.resultIsPaginated))
    );
  }

  /**
   * HTTP GET. Basic get request.
   * @param route the route for the api call
   * @param classReference if not null the response is converted to the classReference
   * @param options custom http options
   */
  public get(route: string, classReference?: ClDeserializationRef,
             options: BlExternalApiHttpOption = {}): Observable<any> {
    return this.httpService.get(route, options).pipe(
      map(result => this.deserialize(result as any, classReference, options.observe, options.resultIsPaginated))
    );
  }

  /**
   * Make an http post with form data with the ip of the lab and the API key of the lab in header
   */
  public postFormData(route: string, formData: any, classReference?: ClDeserializationRef,
                      options: BlExternalApiHttpOption = {}): Observable<any> {
    // add the formData header
    options.headers = Object.assign({}, options.headers, formData.getHeaders());

    return this.post(route, formData.getBuffer(), classReference, options);
  }

  /**
   * Deserialize an object or array using json converter package if the input are not null
   * @param response
   * @param classReference class reference of object
   * @param observe
   * @param isPaginated if true the result is considered as a {@link ClPageI}
   */
  public deserialize(response: AxiosResponse, classReference: ClDeserializationRef,
                     observe: BlExternalApiHttpOptionObserve = 'data', isPaginated: boolean = false): any {

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
    // if the result if paginated (we supposed the json is type of ClPage)
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

  /**
   * Convert the classes or object to plain json object
   * @param object
   * @private
   */
  private convertObjectToPlain(object: any): any {
    return ClCoreJsonConvert.classToPlain(object);
  }
}
