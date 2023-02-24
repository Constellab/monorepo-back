import {Injectable} from '@angular/core';
import {
  FlAdvancedSearchInput,
  FlApiService,
  FlEntityPaginatedDatasource,
  FlQuillJson,
  FlSearchConverter,
  FLSearchFunction,
  FlTag
} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {LabExperiment, LabExperimentDatasource, LabExperimentSimpleForm} from '../model/entities/lab-experiment.entity';
import {ClGetPageFunction, ClPageI} from '@monorepo/core-lib';
import {LabTag} from '../model/entities/lab-tag.entity';
import {
  LabExperimentSearch,
  LabExperimentSearchFields
} from '../entity-module/lab-experiment-core/model/lab-experiment-advanced-search.class';


@Injectable({
  providedIn: 'root'
})
export class LabExperimentService {

  private route: string = 'experiment';

  constructor(private apiService: FlApiService) {
  }

  public getExperiments(page: number, pageSize: number): Observable<ClPageI<LabExperiment>> {
    return this.apiService.get(this.route, LabExperiment,
      {resultIsPaginated: true, page: page, pageSize: pageSize});
  }


  public getExperimentsDatasource(): LabExperimentDatasource {
    return new FlEntityPaginatedDatasource(this.getExperimentsMethod(), 20, true);
  }

  private getExperimentsMethod(): ClGetPageFunction<LabExperiment> {
    return (page: number, pageSize: number): Observable<ClPageI<LabExperiment>> => this.getExperiments(page, pageSize);
  }

  public getExperiment(id: string): Observable<LabExperiment> {
    return this.apiService.get(`${this.route}/${id}`, LabExperiment);
  }

  public create(experiment: LabExperimentSimpleForm): Observable<LabExperiment> {
    return this.apiService.post(this.route, this.experimentFormToBody(experiment), LabExperiment);
  }

  // update the experiment
  public update(experimentId: string, experiment: LabExperimentSimpleForm): Observable<LabExperiment> {
    return this.apiService.put(`${this.route}/${experimentId}`, this.experimentFormToBody(experiment), LabExperiment);
  }

  private experimentFormToBody(experiment: LabExperimentSimpleForm): { title: string, project_id: string } {
    return {
      title: experiment.title,
      project_id: experiment.project?.id ?? null
    };
  }

  public updateDescription(experimentId: string, description: FlQuillJson): Observable<LabExperiment> {
    return this.apiService.put(`${this.route}/${experimentId}/description`, description, LabExperiment);
  }

  public syncWithCentral(id: string): Observable<LabExperiment> {
    return this.apiService.put(`${this.route}/${id}/sync-with-central`, null, LabExperiment);
  }

  // launch an experiment
  public startExperiment(experimentId: string): Observable<LabExperiment> {
    return this.apiService.post(`${this.route}/${experimentId}/start`, null, LabExperiment);
  }

  // stop (kill) an experiment
  public stopExperiment(experimentId: string): Observable<LabExperiment> {
    return this.apiService.post(`${this.route}/${experimentId}/stop`, null, LabExperiment);
  }

  // stop (kill) an experiment
  public resetExperiment(experimentId: string): Observable<LabExperiment> {
    return this.apiService.put(`${this.route}/${experimentId}/reset`, null, LabExperiment);
  }

  public validateExperiment(experimentId: string, projectId: string): Observable<LabExperiment> {
    return this.apiService.put(`${this.route}/${experimentId}/validate/${projectId}`, null, LabExperiment);
  }

  public saveTags(id: string, tags: FlTag[]): Observable<LabTag[]> {
    return this.apiService.put(`${this.route}/${id}/tags`, tags, LabTag);
  }

  public cloneExperiment(id: string): Observable<LabExperiment> {
    return this.apiService.put(`${this.route}/${id}/clone`, null, LabExperiment);
  }

  public getAdvancedSearchFunction(): FLSearchFunction<LabExperiment> {
    return (page: number, pageSize: number, filters?: LabExperimentSearchFields) => this.advancedSearch(page, pageSize, filters);
  }

  public advancedSearch(page: number, pageSize: number, filters?: LabExperimentSearchFields): Observable<ClPageI<LabExperiment>> {
    const data: FlAdvancedSearchInput = {
      filtersCriteria: FlSearchConverter.convertObjectToSearchCriteriaList(filters, LabExperimentSearch.advancedSearchConverter),
      sortsCriteria: null
    };
    return this.apiService.post(`${this.route}/advanced-search`, data, LabExperiment, {
      page: page, pageSize: pageSize, resultIsPaginated: true
    });
  }

  public getRunningExperiments(): Observable<LabExperiment[]> {
    return this.apiService.get(`${this.route}/running`, LabExperiment);
  }

  public deleteExperiment(id: string): Observable<void> {
    return this.apiService.deleteById(this.route, id);
  }

  public getByInputResource(resourceId: string, page: number, pageSize: number): Observable<ClPageI<LabExperiment>> {
    return this.apiService.get(`${this.route}/input-resource/${resourceId}`, LabExperiment,
      {resultIsPaginated: true, page: page, pageSize: pageSize});
  }
}
