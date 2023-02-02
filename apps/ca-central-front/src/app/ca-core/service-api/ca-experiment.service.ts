import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {CaExperiment} from '../model/entities/project/ca-experiment.class';
import {FlApiService} from '@monorepo/front-core-lib';
import {CaTechnicalReport} from '../model/entities/project/ca-technical-report.class';
import {CaLabConfig} from '../model/entities/lab/ca-lab-config.class';

@Injectable({
  providedIn: 'root'
})
export class CaExperimentService {

  private readonly route: string = 'experiments';

  constructor(private apiService: FlApiService) {
  }

  public findCurrentUserLastExperiments(): Observable<CaExperiment[]>{
    return this.apiService.get(`${this.route}/current-last-experiments`, CaExperiment);
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

  public getExperimentTechnicalReport(experimentId: string): Observable<CaTechnicalReport>{
    return this.apiService.get(`${this.route}/${experimentId}/technical-report`, CaTechnicalReport);
  }

  public getExperimentLabConfig(experimentId: string): Observable<CaLabConfig>{
    return this.apiService.get(`${this.route}/${experimentId}/lab-config`, CaLabConfig);
  }
}
