import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

import {Observable} from 'rxjs';
import {FlApiService} from './fl-api.service';
import {FlCleanableService, FlCleanerService} from '../../../utils/fl-cleanable-service';
import {FlHttpOption} from '../model/fl-http-option.class';
import {ClCachedObservable, ClDeserializationRef} from '@monorepo/core-lib';
import {FlApiServiceConfig} from './fl-api-service.config';
import {FlApiErrorService} from './fl-api-error.service';


/**
 * Global service that extends {@link FlApiService}
 * to call make Http request. This service adds a get method that
 * cached the result of a route for the next calls
 *
 * The cache does not work with Paginated routes
 */
@Injectable()
export class FlApiWithCacheService extends FlApiService implements FlCleanableService {

  private routeObservables: Map<string, ClCachedObservable<any>> = new Map();


  constructor(http: HttpClient,
              configService: FlApiServiceConfig,
              errorService: FlApiErrorService) {
    super(http, configService, errorService);
    FlCleanerService.getInstance().registerService(this);
  }

  /**
   * HTTP GET. Get a single element with the id and the result is cached for next calls.
   * @param route the route for the api call
   * @param id of the object to get. The id is added to at the end of the request with a '/'.
   * Can be added in the anywhere in the request with the string '\{id\}'
   * @param classReference if not null the response is converted to the classReference
   * @param options custom http options
   */
  public getByIdWithCache(route: string, id: string, classReference ?: ClDeserializationRef,
                          options: FlHttpOption = {}): Observable<any> {
    const fullRoute = this.getUrlForId(route, id);

    if (!this.routeObservables.has(fullRoute)) {
      this.routeObservables.set(fullRoute, new ClCachedObservable<any>(super.getById(route, id, classReference, options)));
    }

    return this.routeObservables.get(fullRoute).getObs();
  }

  /**
   * HTTP GET. Basic get request where the result is cached.
   * @param route the route for the api call
   * @param classReference if not null the response is converted to the classReference
   * @param options custom http options
   */
  public getWithCache(route: string, classReference ?: ClDeserializationRef,
                      options: FlHttpOption = {}): Observable<any> {
    if (options.page != null || options.pageSize != null) {
      console.error('The getWithCache method does not support pagination, please use normal get');
      return null;
    }

    const fullRoute = this.getUrl(route);

    if (!this.routeObservables.has(fullRoute)) {
      this.routeObservables.set(fullRoute, new ClCachedObservable<any>(super.get(route, classReference, options)));
    }

    return this.routeObservables.get(fullRoute).getObs();
  }

  /**
   * Clear the cache for a route
   */
  public clearRouteCache(route: string): void {
    this.routeObservables.delete(this.getUrl(route));
  }

  /**
   * Clear the cache for a getById route
   */
  public clearRouteByIdCache(route: string, id: string): void {
    this.routeObservables.delete(this.getUrlForId(route, id));
  }

  /**
   * Clear all the caches
   */
  public clearCache(): void {
    this.routeObservables.clear();
  }

  clean(): void {
    this.clearCache();
  }
}
