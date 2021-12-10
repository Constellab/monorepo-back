import {Injectable} from '@angular/core';
import {
  FlAdvancedSearchInput,
  FlApiService,
  FlEntityPaginatedDatasource,
  FlSearchConverter,
  FlSearchService,
  FlTag
} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {BioxExperiment, BioxExperimentDatasource, ExperimentSimpleForm} from '../model/entities/biox-experiment.entity';
import {ClGetPageFunction, ClPageI} from '@monorepo/core-lib';
import {Workflow} from '../../biox/module/biox-experiment-detail-page/model/workflow.class';
import {BioxProtocolGraph} from '../model/entities/process/biox-protocol.entity';
import {BioxExperimentFlowFactory} from '../utils/biox-experiment-flow.factory';
import {mergeMap} from 'rxjs/operators';
import {BioxStudy} from '../model/entities/biox-study.class';
import {BioxTag} from '../model/entities/biox-tag.entity';
import {
  BioxExperimentSearch,
  BioxExperimentSearchFields
} from '../entity-module/biox-experiment-core/model/biox-experiment-advanced-search.class';


@Injectable({
  providedIn: 'root'
})
export class BioxExperimentService implements FlSearchService<BioxExperiment> {

  private route: string = 'experiment';

  constructor(private apiService: FlApiService) {
  }

  public getExperiments(page: number, pageSize: number): Observable<ClPageI<BioxExperiment>> {
    return this.apiService.get(this.route, BioxExperiment,
      {resultIsPaginated: true, page: page, pageSize: pageSize});
  }


  public getExperimentsDatasource(): BioxExperimentDatasource {
    return new FlEntityPaginatedDatasource(this.getExperimentsMethod(), 20, true);
  }

  private getExperimentsMethod(): ClGetPageFunction<BioxExperiment> {
    return (page: number, pageSize: number): Observable<ClPageI<BioxExperiment>> => this.getExperiments(page, pageSize);
  }

  public getExperiment(id: string): Observable<BioxExperiment> {
    return this.apiService.get(`${this.route}/${id}`, BioxExperiment);
  }

  public create(experiment: ExperimentSimpleForm): Observable<BioxExperiment> {
    return this.apiService.post(this.route, experiment, BioxExperiment);
  }

  // update the experiment and the protocol inside if provided
  public update(experimentId: string, experiment: ExperimentSimpleForm): Observable<BioxExperiment> {
    return this.apiService.put(`${this.route}/${experimentId}`, experiment, BioxExperiment);
  }

  public updateExperimentProtocol(experimentId: string, workflow: Workflow): Observable<BioxExperiment> {
    // convert the workflow to a protocol
    const graph: BioxProtocolGraph = BioxExperimentFlowFactory.convertWorkflowToProtocolGraph(workflow);
    return this.apiService.put(`${this.route}/${experimentId}/protocol`, graph, BioxExperiment);
  }

  // launch an experiment
  public startExperiment(experimentId: string): Observable<BioxExperiment> {
    return this.apiService.post(`${this.route}/${experimentId}/start`, BioxExperiment);
  }

  // stop (kill) an experiment
  public stopExperiment(experimentId: string): Observable<BioxExperiment> {
    return this.apiService.post(`${this.route}/${experimentId}/stop`, null, BioxExperiment);
  }

  public saveAndStartExperiment(experimentId: string, workflow: Workflow): Observable<BioxExperiment> {
    return this.updateExperimentProtocol(experimentId, workflow).pipe(
      mergeMap(() => this.startExperiment(experimentId))
    );
  }

  public validateExperiment(experimentId: string, study: BioxStudy): Observable<BioxExperiment> {
    return this.apiService.put(`${this.route}/${experimentId}/validate`, study, BioxExperiment);
  }

  public saveTags(id: string, tags: FlTag[]): Observable<BioxTag[]> {
    return this.apiService.put(`${this.route}/${id}/tags`, tags, BioxTag);
  }

  public cloneExperiment(id: string): Observable<BioxExperiment> {
    return this.apiService.put(`${this.route}/${id}/clone`, null, BioxExperiment);
  }

  public advancedSearch(page: number, pageSize: number, filters?: BioxExperimentSearchFields): Observable<ClPageI<BioxExperiment>> {
    const data: FlAdvancedSearchInput = {
      filtersCriteria: FlSearchConverter.convertObjectToSearchCriteriaList(filters, BioxExperimentSearch.advancedSearchConverter),
      sortsCriteria: null
    };
    return this.apiService.post(`${this.route}/advanced-search`, data, BioxExperiment, {
      page: page, pageSize: pageSize, resultIsPaginated: true
    });
  }
}
