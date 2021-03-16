import {Injectable} from '@angular/core';
import {FlApiService, FlGetPageFunction, FlPage} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {BioxExperiment, BioxExperimentDatasource, BioxExperimentVM} from '../model/entities/biox-experiment.entity';
import {ViewModelDatasourcePaginated} from '../utils/view-model.datasource';
import {createViewModel} from '../model/global/view-model.entity';


@Injectable({
  providedIn: 'root'
})
export class BioxExperimentService {

  constructor(private apiService: FlApiService) {
  }

  public getExperiments(page: number, pageSize: number): Observable<FlPage<BioxExperimentVM>> {
    return this.apiService.get(`experiment/list`, createViewModel(BioxExperiment),
      {resultIsPaginated: true, page: (page + 1), pageSize: pageSize});
  }


  public getExperimentsDatasource(): BioxExperimentDatasource {
    return new ViewModelDatasourcePaginated(this.getExperimentsMethod(), 20, true);
  }

  private getExperimentsMethod(): FlGetPageFunction<BioxExperimentVM> {
    return (page: number, pageSize: number): Observable<FlPage<BioxExperimentVM>> => this.getExperiments(page, pageSize);
  }

  public getExperiment(id: string): Observable<BioxExperimentVM> {
    return this.apiService.get(`view/gws.model.Experiment/${id}/`, createViewModel(BioxExperiment));
  }

  // todo route
  public create(experiment: Partial<BioxExperiment>): Observable<BioxExperiment> {
    return this.apiService.post('', experiment, BioxExperiment);
  }

  // todo route
  public update(experiment: Partial<BioxExperiment>): Observable<BioxExperiment> {
    return this.apiService.put('', experiment, BioxExperiment);
  }
}

