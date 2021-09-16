import {Injectable} from '@angular/core';
import {FlApiService, FlEntityPaginatedDatasource, FlSnackBarService} from '@monorepo/front-core-lib';
import {Observable, throwError} from 'rxjs';
import {BioxExperiment, BioxExperimentDatasource, ExperimentSimpleForm} from '../model/entities/biox-experiment.entity';
import {createViewModel} from '../model/global/view-model.entity';
import {ClGetPageFunction, ClPage} from '@monorepo/core-lib';
import {Workflow} from '../../biox/module/biox-experiment-detail-page/model/workflow.class';
import {BioxProtocolGraph} from '../model/entities/process/biox-protocol.entity';
import {BioxExperimentFlowFactory} from '../utils/biox-experiment-flow.factory';
import {mergeMap} from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class BioxExperimentService {

  constructor(private apiService: FlApiService,
              private snackBarService: FlSnackBarService) {
  }

  public getExperiments(page: number, pageSize: number): Observable<ClPage<BioxExperiment>> {
    return this.apiService.get(`experiment`, BioxExperiment,
      {resultIsPaginated: true, page: page, pageSize: pageSize});
  }


  public getExperimentsDatasource(): BioxExperimentDatasource {
    return new FlEntityPaginatedDatasource(this.getExperimentsMethod(), 20, true);
  }

  private getExperimentsMethod(): ClGetPageFunction<BioxExperiment> {
    return (page: number, pageSize: number): Observable<ClPage<BioxExperiment>> => this.getExperiments(page, pageSize);
  }

  public getExperiment(id: string): Observable<BioxExperiment> {
    return this.apiService.get(`experiment/${id}`, BioxExperiment);
  }

  public create(experiment: ExperimentSimpleForm): Observable<BioxExperiment> {
    return this.apiService.post('experiment', experiment, BioxExperiment);
  }

  // update the experiment and the protocol inside if provided
  public update(experimentId: string, experiment: ExperimentSimpleForm): Observable<BioxExperiment> {
    return this.apiService.put(`experiment/${experimentId}`, experiment, BioxExperiment);
  }

  public updateExperimentProtocol(experimentId: string, workflow: Workflow): Observable<BioxExperiment> {
    // convert the workflow to a protocol
    const graph: BioxProtocolGraph = BioxExperimentFlowFactory.convertWorkflowToProtocolGraph(workflow);

    if (graph == null || Object.keys(graph.nodes).length === 0) {
      this.snackBarService.openErrorMessage('biox.error_empty_experience', true);
      return throwError('biox.error_empty_experience');
    }

    return this.apiService.put(`experiment/${experimentId}/protocol`, graph, BioxExperiment);
  }

  // launch an experiment
  public startExperiment(experimentId: string): Observable<BioxExperiment> {
    return this.apiService.post(`experiment/${experimentId}/start`, createViewModel(BioxExperiment));
  }

  public saveAndStartExperiment(experimentId: string, workflow: Workflow): Observable<BioxExperiment> {
    return this.updateExperimentProtocol(experimentId, workflow).pipe(
      mergeMap(() => this.startExperiment(experimentId))
    );
  }
}
