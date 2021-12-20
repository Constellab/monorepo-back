import {Injectable} from '@angular/core';
import {
  FlAdvancedSearchInput,
  FlApiService,
  FlEntityPaginatedDatasource,
  FlSearchConverter,
  FlSearchService
} from '@monorepo/front-core-lib';
import {Observable, of} from 'rxjs';
import {LabResource, LabResourceDatasource} from '../model/entities/resource/lab-resource.entity';
import {ClPageI} from '@monorepo/core-lib';
import {map} from 'rxjs/operators';
import {LabTypeEntity} from '../model/entities/lab-type/lab-type.entity';
import {
  labGroupResourceViewSpecsByType,
  LabResourceView,
  LabResourceViewSpec,
  LabResourceViewSpecsByType
} from '../model/entities/resource/lab-resource-view.entity';
import {
  LabResourceSearch,
  LabResourceSearchFields
} from '../entity-module/lab-resource-core/model/lab-resource-advanced-search.class';
import {LabCallTransformerParams} from '../model/global/lab-transformer.class';
import {LabConfigValues} from '../model/entities/lab-config.entity';
import {LabProcessType} from '../model/entities/lab-type/lab-process-type.entity';
import {LabTaskType} from '../model/entities/lab-type/lab-task-type.entity';


@Injectable({
  providedIn: 'root'
})
export class LabResourceService implements FlSearchService<LabResource> {

  private readonly route: string = 'resource';
  private readonly resourceTypeRoute: string = 'resource-type';

  constructor(private apiService: FlApiService) {
  }

  //////////////////////////////////////// RESOURCE ///////////////////////////////////////

  public getById(id: string): Observable<LabResource> {
    if (!id) {
      return of(null);
    }

    // get the resource in the correct type
    return this.apiService.get(`${this.route}/${id}`, LabResource);
  }


  public getResourcesByType(type: string, page: number, pageSize: number): Observable<ClPageI<LabResource>> {
    return this.apiService.get(`${this.route}/by-type/${type}`, LabResource,
      {resultIsPaginated: true, page: page, pageSize: pageSize});
  }

  public getResourcesByTypeDatasource(type: string): LabResourceDatasource {
    return new FlEntityPaginatedDatasource(
      (page: number, pageSize: number) => this.getResourcesByType(type, page, pageSize),
      20, true);
  }

  public delete(id: string): Observable<void> {
    return this.apiService.delete(`${this.route}/${id}`);
  }

  public advancedSearch(page: number, pageSize: number, filters?: LabResourceSearchFields): Observable<ClPageI<LabResource>> {
    const data: FlAdvancedSearchInput = {
      filtersCriteria: FlSearchConverter.convertObjectToSearchCriteriaList(filters, LabResourceSearch.advancedSearchConverter),
      sortsCriteria: null
    };
    return this.apiService.post(`${this.route}/advanced-search`, data, LabResource, {
      page: page, pageSize: pageSize, resultIsPaginated: true
    });
  }

  //////////////////////////////////////// RESOURCE TYPE///////////////////////////////////////


  // get the list of resource types
  public getResourceTypes(): Observable<LabTypeEntity[]> {
    return this.apiService.get(this.resourceTypeRoute, LabTypeEntity);
  }


  //////////////////////////////////////// RESOURCE VIEWS  ///////////////////////////////////////

  public getResourceViews(type: string): Observable<LabResourceViewSpec[]> {
    return this.apiService.get(`resource/${type}/views`, LabResourceViewSpec);
  }

  public getResourceViewsByType(type: string): Observable<LabResourceViewSpecsByType[]> {
    return this.getResourceViews(type).pipe(
      map(views => labGroupResourceViewSpecsByType(views)));
  }

  public callResourceView(id: string, viewName: string, config: Record<string, any>,
                          transformers: LabCallTransformerParams[]): Observable<LabResourceView> {
    for (const key in config) {
      if (config[key] == null) {
        delete config[key];
      }
    }
    return this.apiService.post(`resource/${id}/views/${viewName}`, {
      values: config,
      transformers: transformers
    });
  }

  //////////////////////////////////////// TRANSFORMERS  ///////////////////////////////////////
  /**
   * Create an experiment for a resource, with a list of transformers
   * @param transformers
   * @param resourceId
   */
  public transformResource(transformers: LabCallTransformerParams[], resourceId: string): Observable<LabResource> {
    return this.apiService.post(`${this.route}/${resourceId}/transform`, transformers, LabResource);
  }

  //////////////////////////////////////// IMPORTER  ///////////////////////////////////////
  public getImporters(resourceTypingName: string): Observable<LabProcessType[]> {
    return this.apiService.get(`${this.resourceTypeRoute}/${resourceTypingName}/importer`, LabTaskType);
  }

  public callImporter(resourceId: string, importerType: string, config: LabConfigValues): Observable<LabResource>{
    return this.apiService.post(`${this.route}/${resourceId}/import/${importerType}`, config, LabResource);
  }
}
