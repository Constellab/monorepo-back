import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {Experiment, ExperimentStatus, ExperimentStatusHistory} from '../../core/model/entities/experiment.class';
import {Protocol} from '../../core/model/entities/protocol.entity';
import {FlApiService, FlArrayObs, FlEntityArrayObs} from '@monorepo/front-core-lib';

@Injectable({
  providedIn: 'root'
})
export class ExperimentService {

  private readonly route: string = 'experiments';

  constructor(private apiService: FlApiService) {
  }

  public findById(id: string): Observable<Experiment> {
    return this.apiService.get(`${this.route}/${id}`, Experiment);
  }

  public getExperimentsOfProject(projectId: string): Observable<Experiment[]> {
    return this.apiService.get(`${this.route}/project/${projectId}`, Experiment);
  }

  public create(experiment: Partial<Experiment>, projectId: string): Observable<Experiment> {
    return this.apiService.post(`${this.route}/project/${projectId}`, experiment, Experiment);
  }

  public update(experiment: Partial<Experiment>): Observable<Experiment> {
    return this.apiService.put(`${this.route}`, experiment, Experiment);
  }

  public updateProtocol(experimentId: string, protocol: Partial<Protocol>): Observable<Experiment> {
    return this.apiService.put(`${this.route}/${experimentId}/protocol`, protocol, Experiment);
  }

  public startExperiment(experimentId: string): Observable<Experiment> {
    return this.apiService.put(`${this.route}/${experimentId}/start`, null, Experiment);
  }


  ////////////////// STATUS ////////////////////

  // use to pass the updateStatus method to UpdateStatusFormDialog
  public getUpdateStatusMethod(id: string): (status: ExperimentStatus) => Observable<Experiment> {
    return (status): Observable<Experiment> => this.updateStatus(id, status);
  }

  public updateStatus(id: string, status: ExperimentStatus): Observable<Experiment> {
    return this.apiService.put(`${this.route}/${id}/status/${status}`,
      null, Experiment);
  }

  public getStatusHistories(id: string): FlArrayObs<ExperimentStatusHistory> {
    return new FlEntityArrayObs(this.apiService.get(`${this.route}/${id}/status-history`, ExperimentStatusHistory));
  }
}
