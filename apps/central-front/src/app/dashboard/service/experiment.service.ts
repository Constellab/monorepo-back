import {Injectable} from '@angular/core';
import {ApiService} from '../../core/service-api/api.service';
import {Observable} from 'rxjs';
import {Experiment, ExperimentStatus, ExperimentStatusHistory} from '../../core/model/entities/experiment.class';
import {Protocol} from '../../core/model/entities/protocol.entity';
import {ArrayObs} from '../../core/model/datasource/array-obs.class';
import {EntityArrayObs} from '../../core/model/datasource/entity-array.class';

@Injectable({
  providedIn: 'root'
})
export class ExperimentService {

  private readonly route: string = 'experiments';

  constructor(private apiService: ApiService) {
  }

  public findById(id: string): Observable<Experiment> {
    return this.apiService.get(`${this.route}/${id}`, Experiment);
  }

  public getExperimentsOfStudy(studyId: string): ArrayObs<Experiment> {
    return new EntityArrayObs(this.apiService.get(`${this.route}/study/${studyId}`, Experiment));
  }

  public create(experiment: Partial<Experiment>, studyId: string): Observable<Experiment> {
    return this.apiService.post(`${this.route}/study/${studyId}`, experiment, Experiment);
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

  /**
   * retrieve the list of user's experiments that uses the protocol
   */
  public getExperimentsByProtocol(protocolId: string): ArrayObs<Experiment> {
    return new EntityArrayObs(this.apiService.get(`${this.route}/protocol/${protocolId}`, Experiment));
  }


  ////////////////// STATUS ////////////////////

  // use to pass the updateStatus method to UpdateStatusFormDialog
  public getUpdateStatusMethod(id: string): (status: ExperimentStatus) => Observable<Experiment> {
    return (status => this.updateStatus(id, status));
  }

  public updateStatus(id: string, status: ExperimentStatus): Observable<Experiment> {
    return this.apiService.put(`${this.route}/${id}/status/${status}`,
      null, Experiment);
  }

  public getStatusHistories(id: string): ArrayObs<ExperimentStatusHistory> {
    return new EntityArrayObs(this.apiService.get(`${this.route}/${id}/status-history`, ExperimentStatusHistory));
  }
}
