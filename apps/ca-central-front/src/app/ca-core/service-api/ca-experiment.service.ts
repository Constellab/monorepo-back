import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {CaExperiment} from '../model/entities/ca-experiment.class';
import {FlApiService} from '@monorepo/front-core-lib';

@Injectable({
  providedIn: 'root'
})
export class CaExperimentService {

  private readonly route: string = 'experiments';

  constructor(private apiService: FlApiService) {
  }

  public findById(id: string): Observable<CaExperiment> {
    return this.apiService.get(`${this.route}/${id}`, CaExperiment);
  }

  public getExperimentsByProject(projectId: string): Observable<CaExperiment[]> {
    return this.apiService.get(`${this.route}/project/${projectId}`, CaExperiment);
  }

  public getExperimentsByReport(reportId: string): Observable<CaExperiment[]> {
    return this.apiService.get(`${this.route}/report/${reportId}`, CaExperiment);
  }

  public update(experiment: Partial<CaExperiment>): Observable<CaExperiment> {
    return this.apiService.put(`${this.route}`, experiment, CaExperiment);
  }
}
