import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {CaExperimentStatusHistory, Experiment} from '../model/entities/ca-experiment.class';
import {FlApiService, FlArrayObs, FlEntityArrayObs} from '@monorepo/front-core-lib';

@Injectable({
  providedIn: 'root'
})
export class CaExperimentService {

  private readonly route: string = 'experiments';

  constructor(private apiService: FlApiService) {
  }

  public findById(id: string): Observable<Experiment> {
    return this.apiService.get(`${this.route}/${id}`, Experiment);
  }

  public getExperimentsOfProject(projectId: string): Observable<Experiment[]> {
    return this.apiService.get(`${this.route}/project/${projectId}`, Experiment);
  }


  public update(experiment: Partial<Experiment>): Observable<Experiment> {
    return this.apiService.put(`${this.route}`, experiment, Experiment);
  }

  ////////////////// STATUS ////////////////////

  public getStatusHistories(id: string): FlArrayObs<CaExperimentStatusHistory> {
    return new FlEntityArrayObs(this.apiService.get(`${this.route}/${id}/status-history`, CaExperimentStatusHistory));
  }
}
