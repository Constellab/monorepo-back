import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {
  LabInstance,
  LabInstanceDatasource,
  LabInstanceStatusHistory,
  LabInstanceToken,
  LabInstanceUser,
  LabInstanceUserForm
} from '../model/entities/lab-instance.class';
import {FlApiService, FlArrayObs, FlEntityArrayObs, FlEntityPaginatedDatasource} from '@monorepo/front-core-lib';
import {ClGetPageFunction, ClPageI, clRxjsDebug} from '@monorepo/core-lib';

@Injectable({
  providedIn: 'root'
})
export class LabInstanceService {

  private readonly route: string = 'lab-instances';

  constructor(private apiService: FlApiService) {
  }

  public create(entity: Partial<LabInstance>): Observable<LabInstance> {
    return this.apiService.post(this.route, entity, LabInstance);
  }

  public update(entity: Partial<LabInstance>): Observable<LabInstance> {
    return this.apiService.put(this.route, entity, LabInstance);
  }

  public getCurrentLabInstance(): Observable<LabInstance[]> {
    return this.apiService.get(this.route + '/current', LabInstance);
  }

  /**
   * Return the list of the current user's projects
   */
  public getCurrentLabInstancesDatasource(): LabInstanceDatasource {
    return new FlEntityPaginatedDatasource(this.getCurrentLabInstanceMethod(), 20);
  }

  /**
   * Return the list of the 4 first lab instance for a user
   */
  public getDashboardCurrentLabInstancesDatasource(): LabInstanceDatasource {
    return new FlEntityPaginatedDatasource(this.getCurrentLabInstanceMethod(), 4);
  }

  private getCurrentLabInstanceMethod(): ClGetPageFunction<LabInstance> {
    return (page: number, pageSize: number): Observable<ClPageI<LabInstance>> => this.apiService.get(`${this.route}/current`, LabInstance,
      {resultIsPaginated: true, page: page, pageSize: pageSize}).pipe(clRxjsDebug());
  }

  public getCurrentRunningLabInstance(): Observable<LabInstance[]> {
    return this.apiService.get(this.route + '/current-running', LabInstance);
  }

  public startLabInstance(id: string): Observable<LabInstance> {
    return this.apiService.put(`${this.route}/${id}/start`, null, LabInstance);
  }

  public stopLabInstance(id: string): Observable<LabInstance> {
    return this.apiService.put(`${this.route}/${id}/stop`, null, LabInstance);
  }

  public findById(id: string): Observable<LabInstance> {
    return this.apiService.get(`${this.route}/${id}`, LabInstance);
  }

  public getStatusHistories(id: string): FlArrayObs<LabInstanceStatusHistory> {
    return new FlEntityArrayObs(this.apiService.get(`${this.route}/${id}/status-history`, LabInstanceStatusHistory));
  }

  /**
   * Log the user to the lab instance and return the authentication in the cookie
   */
  public logUserToLab(id: string): Observable<LabInstanceToken> {
    return this.apiService.post(`${this.route}/${id}/login`, null, LabInstanceToken);
  }

  public getAll(): FlArrayObs<LabInstance> {
    return new FlEntityArrayObs(this.apiService.get(this.route, LabInstance));
  }

  public getLabInstanceUsers(id: string): Observable<LabInstanceUser[]> {
    return this.apiService.get(`${this.route}/${id}/users`, LabInstanceUser).pipe(clRxjsDebug());
  }

  public addUserToLab(labId: string, labInstanceUserForm: LabInstanceUserForm): Observable<LabInstanceUser> {
    const object = {
      userId: labInstanceUserForm.user.id,
      group: labInstanceUserForm.group
    };
    return this.apiService.post(`${this.route}/${labId}/add-user`, object, LabInstanceUser);
  }

  public updateName(id: string, name: string): Observable<LabInstance> {
    return this.apiService.put(`${this.route}/${id}/name/${name}`, null);
  }

}
