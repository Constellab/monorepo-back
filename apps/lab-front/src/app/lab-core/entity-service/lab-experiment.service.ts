import {Injectable} from '@angular/core';
import {
  FlAdvancedSearchInput,
  FlApiService,
  FlEntityPaginatedDatasource,
  FlQuillJson,
  FlSearchConverter,
  FlSearchService,
  FlTag
} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {LabExperiment, LabExperimentDatasource, LabExperimentSimpleForm} from '../model/entities/lab-experiment.entity';
import {ClGetPageFunction, ClPageI} from '@monorepo/core-lib';
import {LabWorkflow} from '../../lab-biox/module/lab-experiment-detail-page/model/lab-workflow.class';
import {LabProtocolGraph} from '../model/entities/process/lab-protocol.entity';
import {LabExperimentFlowFactory} from '../utils/lab-experiment-flow.factory';
import {mergeMap} from 'rxjs/operators';
import {LabProject} from '../model/entities/lab-project.class';
import {LabTag} from '../model/entities/lab-tag.entity';
import {
  LabExperimentSearch,
  LabExperimentSearchFields
} from '../entity-module/lab-experiment-core/model/lab-experiment-advanced-search.class';


@Injectable({
  providedIn: 'root'
})
export class LabExperimentService implements FlSearchService<LabExperiment> {

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
    return this.apiService.post(this.route, experiment, LabExperiment);
  }

  // update the experiment and the protocol inside if provided
  public update(experimentId: string, experiment: LabExperimentSimpleForm): Observable<LabExperiment> {
    return this.apiService.put(`${this.route}/${experimentId}`, experiment, LabExperiment);
  }

  public updateDescription(experimentId: string, description: FlQuillJson): Observable<LabExperiment> {
    return this.apiService.put(`${this.route}/${experimentId}/description`, description, LabExperiment);
  }

  public updateExperimentProtocol(experimentId: string, workflow: LabWorkflow): Observable<LabExperiment> {
    // convert the workflow to a protocol
    const graph: LabProtocolGraph = LabExperimentFlowFactory.convertWorkflowToProtocolGraph(workflow);
    return this.apiService.put(`${this.route}/${experimentId}/protocol`, graph, LabExperiment);
  }

  // launch an experiment
  public startExperiment(experimentId: string): Observable<LabExperiment> {
    return this.apiService.post(`${this.route}/${experimentId}/start`, LabExperiment);
  }

  // stop (kill) an experiment
  public stopExperiment(experimentId: string): Observable<LabExperiment> {
    return this.apiService.post(`${this.route}/${experimentId}/stop`, null, LabExperiment);
  }

  // stop (kill) an experiment
  public resetExperiment(experimentId: string): Observable<LabExperiment> {
    return this.apiService.put(`${this.route}/${experimentId}/reset`, null, LabExperiment);
  }

  public saveAndStartExperiment(experimentId: string, workflow: LabWorkflow): Observable<LabExperiment> {
    return this.updateExperimentProtocol(experimentId, workflow).pipe(
      mergeMap(() => this.startExperiment(experimentId))
    );
  }

  public validateExperiment(experimentId: string, project: LabProject): Observable<LabExperiment> {
    return this.apiService.put(`${this.route}/${experimentId}/validate`, project, LabExperiment);
  }

  public saveTags(id: string, tags: FlTag[]): Observable<LabTag[]> {
    return this.apiService.put(`${this.route}/${id}/tags`, tags, LabTag);
  }

  public cloneExperiment(id: string): Observable<LabExperiment> {
    return this.apiService.put(`${this.route}/${id}/clone`, null, LabExperiment);
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
}
