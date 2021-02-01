import {Injectable} from '@angular/core';
import {FlApiService, FlEntityPaginatedDatasource, FlGetPageFunction, FlPage} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {BioxExperiment, BioxExperimentDatasource} from '../model/entities/biox-experiment.entity';
import {BioxExperimentFlow} from '../model/entities/biox-experiment-flow.entity';
import {map} from 'rxjs/operators';
import {clRxjsDebug} from '@monorepo/core-lib';


@Injectable({
  providedIn: 'root'
})
export class BioxExperimentService {


  constructor(private apiService: FlApiService) {
  }

  public getExperiments(page: number, pageSize: number): Observable<FlPage<BioxExperiment>> {
    return this.apiService.get(`experiment/list`, BioxExperiment, {resultIsPaginated: true, page: (page + 1), pageSize: pageSize});
  }

  public getExperimentsDatasource(): BioxExperimentDatasource {
    return new FlEntityPaginatedDatasource(this.getExperimentsMethod(), 20, true);
  }

  private getExperimentsMethod(): FlGetPageFunction<BioxExperiment> {
    return (page: number, pageSize: number): Observable<FlPage<BioxExperiment>> => this.getExperiments(page, pageSize);
  }

  public getExperiment(id: string): Observable<BioxExperiment> {
    return this.apiService.get(`gws.model.Experiment/${id}`, BioxExperiment);
  }

  /////////////////////// FLOW ////////////////////////
  public getExperimentFlow(id: string): Observable<BioxExperimentFlow> {
    return this.apiService.get(`flow?experiment_uri=${id}`, BioxExperimentFlow).pipe(
      map(flow => this.initFlowConnections(flow)),
      clRxjsDebug(),
    );
  }

  private initFlowConnections(protocol: BioxExperimentFlow): BioxExperimentFlow {
    protocol.initConnectionsAndNodes();
    return protocol;
  }


}
