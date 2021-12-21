import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {
  CaLabInstance,
  CaLabInstanceDatasource,
  CaLabInstanceStatusHistory,
  CaLabInstanceToken,
  CaLabInstanceUser,
  CaLabInstanceUserForm
} from '../model/entities/ca-lab-instance.class';
import {FlApiService, FlArrayObs, FlEntityArrayObs, FlEntityPaginatedDatasource} from '@monorepo/front-core-lib';
import {ClGetPageFunction, ClPageI} from '@monorepo/core-lib';

@Injectable({
  providedIn: 'root'
})
export class CaLabInstanceService {

  private readonly route: string = 'lab-instances';

  constructor(private apiService: FlApiService) {
  }

  public create(entity: Partial<CaLabInstance>): Observable<CaLabInstance> {
    return this.apiService.post(this.route, entity, CaLabInstance);
  }

  public update(entity: Partial<CaLabInstance>): Observable<CaLabInstance> {
    return this.apiService.put(this.route, entity, CaLabInstance);
  }

  public delete(id: string): Observable<CaLabInstance> {
    return this.apiService.deleteById(this.route, id, CaLabInstance);
  }

  public getCurrentLabInstance(): Observable<CaLabInstance[]> {
    return this.apiService.get(this.route + '/current', CaLabInstance);
  }

  /**
   * Return the list of the current user's projects
   */
  public getCurrentLabInstancesDatasource(): CaLabInstanceDatasource {
    return new FlEntityPaginatedDatasource(this.getCurrentLabInstanceMethod(), 20);
  }

  /**
   * Return the list of the 4 first lab instance for a user
   */
  public getDashboardCurrentLabInstancesDatasource(): CaLabInstanceDatasource {
    return new FlEntityPaginatedDatasource(this.getCurrentLabInstanceMethod(), 4);
  }

  private getCurrentLabInstanceMethod(): ClGetPageFunction<CaLabInstance> {
    return (page: number, pageSize: number): Observable<ClPageI<CaLabInstance>> =>
      this.apiService.get(`${this.route}/current`, CaLabInstance,
        {resultIsPaginated: true, page: page, pageSize: pageSize});
  }

  public getCurrentRunningLabInstance(): Observable<CaLabInstance[]> {
    return this.apiService.get(this.route + '/current-running', CaLabInstance);
  }

  public startLabInstance(id: string): Observable<CaLabInstance> {
    return this.apiService.put(`${this.route}/${id}/start`, null, CaLabInstance);
  }

  public stopLabInstance(id: string): Observable<CaLabInstance> {
    return this.apiService.put(`${this.route}/${id}/stop`, null, CaLabInstance);
  }

  public findById(id: string): Observable<CaLabInstance> {
    return this.apiService.get(`${this.route}/${id}`, CaLabInstance);
  }

  public getStatusHistories(id: string): FlArrayObs<CaLabInstanceStatusHistory> {
    return new FlEntityArrayObs(this.apiService.get(`${this.route}/${id}/status-history`, CaLabInstanceStatusHistory));
  }

  /**
   * Log the user to the lab instance and return the authentication in the cookie
   */
  public logUserToLab(id: string): Observable<CaLabInstanceToken> {
    return this.apiService.post(`${this.route}/${id}/login`, null, CaLabInstanceToken);
  }

  public getAll(): FlArrayObs<CaLabInstance> {
    return new FlEntityArrayObs(this.apiService.get(this.route, CaLabInstance));
  }

  public getLabInstanceUsers(id: string): Observable<CaLabInstanceUser[]> {
    return this.apiService.get(`${this.route}/${id}/users`, CaLabInstanceUser);
  }

  public addUserToLab(labId: string, labInstanceUserForm: CaLabInstanceUserForm): Observable<CaLabInstanceUser> {
    const object = {
      userId: labInstanceUserForm.user.id,
      group: labInstanceUserForm.group
    };
    return this.apiService.post(`${this.route}/${labId}/add-user`, object, CaLabInstanceUser);
  }

  public updateName(id: string, name: string): Observable<CaLabInstance> {
    return this.apiService.put(`${this.route}/${id}/name/${name}`, null);
  }

  public checkStatus(id: string): Observable<any> {
    return this.apiService.get(`${this.route}/${id}/check-status`);
  }

}
