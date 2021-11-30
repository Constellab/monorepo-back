import {Injectable} from '@angular/core';
import {
  FlAdvancedSearchInput,
  FlApiService,
  FlEntityPaginatedDatasource,
  FlSearchConverter,
  FlSearchService
} from '@monorepo/front-core-lib';
import {Observable, of} from 'rxjs';
import {BioxResource, BioxResourceDatasource} from '../model/entities/resource/biox-resource.entity';
import {ClPageI} from '@monorepo/core-lib';
import {map} from 'rxjs/operators';
import {BioxLabTypeEntity} from '../model/entities/lab-type/biox-lab-type.entity';
import {
  bioxGroupResourceViewSpecsByType,
  BioxResourceView,
  BioxResourceViewBase,
  BioxResourceViewSpec,
  BioxResourceViewSpecsByType
} from '../model/entities/resource/biox-resource-view.entity';
import {
  BioxResourceSearch,
  BioxResourceSearchFields
} from '../entity-module/biox-resource-core/model/biox-resource-advanced-search.class';


@Injectable({
  providedIn: 'root'
})
export class BioxResourceService implements FlSearchService<BioxResource> {

  private readonly route: string = 'resource';
  private readonly resourceTypeRoute: string = 'resource-type';

  constructor(private apiService: FlApiService) {
  }

  //////////////////////////////////////// RESOURCE ///////////////////////////////////////

  public getById(id: string): Observable<BioxResource> {
    if (!id) {
      return of(null);
    }

    // get the resource in the correct type
    return this.apiService.get(`${this.route}/${id}`, BioxResource);
  }


  public getResourcesByType(type: string, page: number, pageSize: number): Observable<ClPageI<BioxResource>> {
    return this.apiService.get(`${this.route}/by-type/${type}`, BioxResource,
      {resultIsPaginated: true, page: page, pageSize: pageSize});
  }

  public getResourcesByTypeDatasource(type: string): BioxResourceDatasource {
    return new FlEntityPaginatedDatasource(
      (page: number, pageSize: number) => this.getResourcesByType(type, page, pageSize),
      20, true);
  }

  public delete(id: string): Observable<void> {
    return this.apiService.delete(`${this.route}/${id}`);
  }

  public advancedSearch(page: number, pageSize: number, filters?: BioxResourceSearchFields): Observable<ClPageI<BioxResource>> {
    const data: FlAdvancedSearchInput = {
      filtersCriteria: FlSearchConverter.convertObjectToSearchCriteriaList(filters, BioxResourceSearch.advancedSearchConverter),
      sortsCriteria: null
    };
    return this.apiService.post(`${this.route}/advanced-search`, data, BioxResource, {
      page: page, pageSize: pageSize, resultIsPaginated: true
    });
  }

  //////////////////////////////////////// RESOURCE TYPE///////////////////////////////////////


  // get the list of resource types
  public getResourceTypes(): Observable<BioxLabTypeEntity[]> {
    return this.apiService.get(this.resourceTypeRoute, BioxLabTypeEntity);
  }


  //////////////////////////////////////// RESOURCE VIEWS  ///////////////////////////////////////

  public getResourceViews(type: string): Observable<BioxResourceViewSpec[]> {
    return this.apiService.get(`resource/${type}/views`, BioxResourceViewSpec);
  }

  public getResourceViewsByType(type: string): Observable<BioxResourceViewSpecsByType[]> {
    return this.getResourceViews(type).pipe(
      map(views => bioxGroupResourceViewSpecsByType(views)));
  }

  public callResourceView(id: string, viewName: string, config: Record<string, any>): Observable<BioxResourceView> {
    for (const key in config) {
      if (config[key] == null) {
        delete config[key];
      }
    }
    return this.apiService.post(`resource/${id}/views/${viewName}`, config, BioxResourceViewBase);
  }

}
