import {Injectable} from '@angular/core';
import {FlApiService, FlEntityPaginatedDatasource, FlGetPageFunction, FlPage} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {LabExperiment, LabExperimentDatasource} from '../model/entities/lab-experiment.entity';


@Injectable({
  providedIn: 'root'
})
export class LabExperimentService {


  constructor(private apiService: FlApiService) {
  }

  public getExperiments(page: number, pageSize: number): Observable<FlPage<LabExperiment>> {
    return this.apiService.get(`experiment/list`, LabExperiment, {resultIsPaginated: true, page: (page + 1), pageSize: pageSize});
  }

  public getExperimentsDatasource(): LabExperimentDatasource {
    return new FlEntityPaginatedDatasource(this.getExperimentsMethod(), 20, true);
  }

  private getExperimentsMethod(): FlGetPageFunction<LabExperiment> {
    return (page: number, pageSize: number): Observable<FlPage<LabExperiment>> => this.getExperiments(page, pageSize);
  }

  public getExperiment(id: string): Observable<LabExperiment> {
    return this.apiService.get(`gws.model.Experiment/${id}`, LabExperiment);
  }
}
