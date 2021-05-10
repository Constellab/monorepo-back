import {Injectable} from '@angular/core';
import {FlApiService, FlEntityPaginatedDatasource} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {BioxExperiment, BioxExperimentDatasource, BioxExperimentVM} from '../model/entities/biox-experiment.entity';
import {createViewModel} from '../model/global/view-model.entity';
import {ClGetPageFunction, ClPage} from '@monorepo/core-lib';


@Injectable({
  providedIn: 'root'
})
export class BioxExperimentService {

  constructor(private apiService: FlApiService) {
  }

  public getExperiments(page: number, pageSize: number): Observable<ClPage<BioxExperiment>> {
    return this.apiService.get(`experiment/list`, BioxExperiment,
      {resultIsPaginated: true, page: (page + 1), pageSize: pageSize});
  }


  public getExperimentsDatasource(): BioxExperimentDatasource {
    return new FlEntityPaginatedDatasource(this.getExperimentsMethod(), 20, true);
  }

  private getExperimentsMethod(): ClGetPageFunction<BioxExperiment> {
    return (page: number, pageSize: number): Observable<ClPage<BioxExperiment>> => this.getExperiments(page, pageSize);
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

