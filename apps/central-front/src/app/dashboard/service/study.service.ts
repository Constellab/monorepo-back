import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {Study, StudyStatus, StudyStatusHistory} from '../../core/model/entities/study.class';
import {FlApiService, FlArrayObs, FlEntityArrayObs} from '@monorepo/front-core-lib';

@Injectable({
  providedIn: 'root'
})
export class StudyService {

  private readonly route: string = 'studies';

  constructor(private apiService: FlApiService) {
  }

  public findById(id: string): Observable<Study> {
    return this.apiService.get(`${this.route}/${id}`, Study);
  }

  public getStudiesOfProject(projectId: string): FlArrayObs<Study> {
    return new FlEntityArrayObs(this.apiService.get(`${this.route}/project/${projectId}`, Study));
  }

  public create(study: Partial<Study>, projectId: string): Observable<Study> {
    return this.apiService.post(`${this.route}/project/${projectId}`, study, Study);
  }

  public update(study: Partial<Study>): Observable<Study> {
    return this.apiService.put(`${this.route}`, study, Study);
  }

  ////////////////// STATUS ////////////////////

  // use to pass the updateStatus method to UpdateStatusFormDialog
  public getUpdateStatusMethod(id: string): (status: StudyStatus) => Observable<Study> {
    return (status => this.updateStatus(id, status));
  }

  public updateStatus(id: string, status: StudyStatus): Observable<Study> {
    return this.apiService.put(`${this.route}/${id}/status/${status}`,
      null, Study);
  }

  public getStatusHistories(id: string): FlArrayObs<StudyStatusHistory> {
    return new FlEntityArrayObs(this.apiService.get(`${this.route}/${id}/status-history`, StudyStatusHistory));
  }
}
