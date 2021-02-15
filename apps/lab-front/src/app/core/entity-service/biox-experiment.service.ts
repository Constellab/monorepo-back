import {Injectable} from '@angular/core';
import {FlApiService, FlEntityPaginatedDatasource, FlGetPageFunction, FlPage} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {BioxExperiment, BioxExperimentDatasource} from '../model/entities/biox-experiment.entity';
import {delay} from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class BioxExperimentService {


  constructor(private apiService: FlApiService) {
  }

  public getExperiments(page: number, pageSize: number): Observable<FlPage<BioxExperiment>> {
    return this.apiService.get(`experiment/list`, BioxExperiment,
      {resultIsPaginated: true, page: (page + 1), pageSize: pageSize}).pipe(delay(3000));
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


}
