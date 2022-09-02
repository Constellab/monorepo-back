import {Injectable} from '@angular/core';
import {
  FlAdvancedSearchInput,
  FlApiService,
  FlFileHelper,
  FlSearchConverter,
  FLSearchFunction,
  FlTag
} from '@monorepo/front-core-lib';
import {Observable, of} from 'rxjs';
import {LabResource} from '../model/entities/resource/lab-resource.entity';
import {ClPageI} from '@monorepo/core-lib';
import {map} from 'rxjs/operators';
import {LabTypeEntity} from '../model/entities/lab-type/lab-type.entity';
import {
  LabResourceView,
  LabResourceViewData,
  LabResourceViewSpec,
  LabResourceViewSpecComplete,
} from '../model/entities/resource/lab-resource-view.entity';
import {
  LabResourceSearch,
  LabResourceSearchFields
} from '../entity-module/lab-resource-core/model/lab-resource-advanced-search.class';
import {LabConfigValues} from '../model/entities/lab-config.entity';
import {LabResourceImporterType} from '../model/entities/resource/lab-resource.dto';
import {LabTypeService} from './lab-type.service';
import {LabProcessType} from '../model/entities/lab-type/lab-process-type.entity';
import {LabTag} from '../model/entities/lab-tag.entity';
import {RvTransformerParams} from '@monorepo/resource-view';


@Injectable({
  providedIn: 'root'
})
export class LabResourceService {

  public static readonly defaultViewName: string = 'default-view';
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

  public getResourceChildren(id: string): Observable<LabResource[]> {
    // get the resource in the correct type
    return this.apiService.get(`${this.route}/${id}/children`, LabResource);
  }

  public delete(id: string): Observable<void> {
    return this.apiService.delete(`${this.route}/${id}`);
  }

  public updateName(id: string, name: string): Observable<LabResource> {
    return this.apiService.put(`${this.route}/${id}/name/${name}`, null, LabResource);
  }

  public updateResourceType(id: string, resourceTypingName: string): Observable<LabResource> {
    return this.apiService.put(`${this.route}/${id}/type/${resourceTypingName}`, null, LabResource);
  }

  public getAdvancedSearchFunction(): FLSearchFunction<LabResource> {
    return (page: number, pageSize: number, filters?: LabResourceSearchFields) => this.advancedSearch(page, pageSize, filters);
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

  public updateFlagged(id: string, flagged: boolean): Observable<LabResource> {
    return this.apiService.put(`${this.route}/${id}/flagged`, {flagged: flagged}, LabResource);
  }


  public saveTags(id: string, tags: FlTag[]): Observable<LabTag[]> {
    return this.apiService.put(`${this.route}/${id}/tags`, tags, LabTag);
  }

  //////////////////////////////////////// RESOURCE TYPE ///////////////////////////////////////


  // get the list of resource types
  public getResourceTypes(): Observable<LabTypeEntity[]> {
    return this.apiService.get(this.resourceTypeRoute, LabTypeEntity);
  }

  // get the view specs for a resource type
  public getResourceTypeViewSpecsDetail(resourceTypingName: string, viewName: string): Observable<LabResourceViewSpecComplete> {
    return this.apiService.get(`${this.resourceTypeRoute}/${resourceTypingName}/views/${viewName}/specs`, LabResourceViewSpecComplete);
  }

  public getResourceViewsList(resourceTypingName: string): Observable<LabResourceViewSpec[]> {
    return this.apiService.get(`${this.resourceTypeRoute}/${resourceTypingName}/views`, LabResourceViewSpec).pipe(
      map((views: LabResourceViewSpec[]) =>
        views.sort(view => view.defaultView ? -1 : 1))
    );
  }


  //////////////////////////////////////// RESOURCE VIEWS  ///////////////////////////////////////


  // get the view specs for a resource
  public getResourceViewSpecsDetail(id: string, viewName: string): Observable<LabResourceViewSpecComplete> {
    return this.apiService.get(`${this.route}/${id}/views/${viewName}/specs`, LabResourceViewSpecComplete);
  }

  /**
   * Call a view on a resource
   * @param id
   * @param viewMethodName
   * @param config
   * @param transformers
   * @param saveViewConfig if true the config is saved in the historic
   */
  public callResourceViewData(id: string, viewMethodName: string, config: LabConfigValues,
                              transformers: RvTransformerParams[], saveViewConfig: boolean = false): Observable<LabResourceViewData> {
    return this.callResourceView(id, viewMethodName, config, transformers, saveViewConfig).pipe(
      map(labView => labView.view)
    );
  }

  public callResourceView(id: string, viewMethodName: string, configValue: LabConfigValues,
                          transformers: RvTransformerParams[], saveViewConfig: boolean = false): Observable<LabResourceView> {
    for (const key in configValue) {
      if (configValue[key] == null) {
        delete configValue[key];
      }
    }
    return this.apiService.post(`${this.route}/${id}/views/${viewMethodName}`, {
      values: configValue,
      transformers: transformers,
      save_view_config: saveViewConfig
    }, LabResourceView);
  }

  public callResourceDefaultView(id: string, saveViewConfig: boolean = false): Observable<LabResourceView> {
    return this.callResourceView(id, LabResourceService.defaultViewName, {}, [], saveViewConfig);
  }

  //////////////////////////////////////// TRANSFORMERS  ///////////////////////////////////////
  /**
   * Create an experiment for a resource, with a list of transformers
   * @param transformers
   * @param resourceId
   */
  public transformResource(transformers: RvTransformerParams[], resourceId: string): Observable<LabResource> {
    return this.apiService.post(`${this.route}/${resourceId}/transform`, transformers, LabResource);
  }

  //////////////////////////////////////// IMPORTER  ///////////////////////////////////////
  public getImporters(resourceTypingName: string, extension: string): Observable<LabResourceImporterType[]> {
    return this.apiService.get(`${this.resourceTypeRoute}/${resourceTypingName}/${extension ?? ' '}/importer`, LabResourceImporterType);
  }

  public callImporter(resourceId: string, importerType: string, config: LabConfigValues): Observable<LabResource> {
    return this.apiService.post(`${this.route}/${resourceId}/import/${importerType}`, config, LabResource);
  }

  //////////////////////////////////////// EXPORTER  ///////////////////////////////////////

  public getResourceExporterConfig(resourceTypingName: string): Observable<LabProcessType> {
    return this.apiService.get(`${this.route}/${resourceTypingName}/exporter`, LabTypeService.deserializeTyping);
  }

  public downloadResource(resourceId: string, exporterTypingName: string, config: LabConfigValues): void {
    // create the download url, with config params
    const fullUrl = this.apiService.getBaseRouteUrl(`resource/${resourceId}/download/${exporterTypingName}`) + '?' +
      this.apiService.convertRecordToURLParams(config);

    FlFileHelper.downloadUrl(fullUrl);
  }

}
