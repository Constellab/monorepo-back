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
import {BioxStudy} from '../model/entities/biox-study.class';


@Injectable({
  providedIn: 'root'
})
export class BioxExperimentService {

  private route: string = 'experiment';

  constructor(private apiService: FlApiService,
              private snackBarService: FlSnackBarService) {
  }

  public getExperiments(page: number, pageSize: number): Observable<ClPage<BioxExperiment>> {
    return this.apiService.get(this.route, BioxExperiment,
      {resultIsPaginated: true, page: page, pageSize: pageSize});
  }


  public getExperimentsDatasource(): BioxExperimentDatasource {
    return new FlEntityPaginatedDatasource(this.getExperimentsMethod(), 20, true);
  }

  private getExperimentsMethod(): ClGetPageFunction<BioxExperiment> {
    return (page: number, pageSize: number): Observable<ClPage<BioxExperiment>> => this.getExperiments(page, pageSize);
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

    if (graph == null || Object.keys(graph.nodes).length === 0) {
      this.snackBarService.openErrorMessage('biox.error_empty_experience', true);
      return throwError('biox.error_empty_experience');
    }

    return this.apiService.put(`${this.route}/${experimentId}/protocol`, graph, BioxExperiment);
  }

  // launch an experiment
  public startExperiment(experimentId: string): Observable<BioxExperiment> {
    return this.apiService.post(`${this.route}/${experimentId}/start`, createViewModel(BioxExperiment));
  }

  public saveAndStartExperiment(experimentId: string, workflow: Workflow): Observable<BioxExperiment> {
    return this.updateExperimentProtocol(experimentId, workflow).pipe(
      mergeMap(() => this.startExperiment(experimentId))
    );
  }

  public validateExperiment(experimentId: string, study: BioxStudy): Observable<BioxExperiment> {
    return this.apiService.put(`${this.route}/${experimentId}/validate`, study, BioxExperiment);
  }
}
