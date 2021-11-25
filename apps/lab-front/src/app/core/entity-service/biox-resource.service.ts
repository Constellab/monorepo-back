import {Injectable} from '@angular/core';
import {FlApiService, FlEntityPaginatedDatasource} from '@monorepo/front-core-lib';
import {Observable, of} from 'rxjs';
import {BioxResource, BioxResourceDatasource} from '../model/entities/resource/biox-resource.entity';
import {ClPageI} from '@monorepo/core-lib';
import {map} from 'rxjs/operators';
import {BioxLabTypeEntity, BioxLabTypeEntityDatasource} from '../model/entities/lab-type/biox-lab-type.entity';
import {
  bioxGroupResourceViewSpecsByType,
  BioxResourceView,
  BioxResourceViewBase,
  BioxResourceViewSpec,
  BioxResourceViewSpecsByType
} from '../model/entities/resource/biox-resource-view.entity';


@Injectable({
  providedIn: 'root'
})
export class BioxResourceService {

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

  //////////////////////////////////////// RESOURCE TYPE///////////////////////////////////////


  // get the list of resource types
  public getResourceTypes(page: number, pageSize: number): Observable<ClPageI<BioxLabTypeEntity>> {
    return this.apiService.get(this.resourceTypeRoute, BioxLabTypeEntity,
      {resultIsPaginated: true, page: page, pageSize: pageSize});
  }

  public getResourceTypesDatasource(): BioxLabTypeEntityDatasource {
    return new FlEntityPaginatedDatasource(
      (page: number, pageSize: number) => this.getResourceTypes(page, pageSize),
      20, true);
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
