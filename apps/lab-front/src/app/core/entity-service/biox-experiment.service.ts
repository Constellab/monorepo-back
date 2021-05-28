import {Injectable} from '@angular/core';
import {FlApiService, FlEntityPaginatedDatasource} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {BioxExperiment, BioxExperimentDatasource, ExperimentSimpleForm} from '../model/entities/biox-experiment.entity';
import {createViewModel} from '../model/global/view-model.entity';
import {ClGetPageFunction, ClPage} from '@monorepo/core-lib';


@Injectable({
  providedIn: 'root'
})
export class BioxExperimentService {

  constructor(private apiService: FlApiService) {
  }

  public getExperiments(page: number, pageSize: number): Observable<ClPage<BioxExperiment>> {
    return this.apiService.get(`experiment`, BioxExperiment,
      {resultIsPaginated: true, page: (page + 1), pageSize: pageSize});
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

  // launch an experiment
  public startExperiment(experimentId: string): Observable<BioxExperiment> {
    return this.apiService.post(`experiment/${experimentId}/start`, createViewModel(BioxExperiment));
  }
}
