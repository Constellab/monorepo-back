import {Injectable} from '@angular/core';
import {ApiService} from './api.service';
import {Observable} from 'rxjs';
import {LabInstance, LabInstanceDatasource, LabInstanceStatusHistory, LabInstanceToken} from '../model/entities/lab-instance.class';
import {EntityPaginatedDatasource} from '../model/datasource/entity-datasource.class';
import {GetPageFunction, Page} from '../model/global/page.class';
import {ArrayObs} from '../model/datasource/array-obs.class';
import {EntityArrayObs} from '../model/datasource/entity-array.class';

@Injectable({
  providedIn: 'root'
})
export class LabInstanceService {

  private readonly route: string = 'lab-instances';

  constructor(private apiService: ApiService) {
  }

  public create(entity: Partial<LabInstance>): Observable<LabInstance>{
    return this.apiService.post(this.route, entity, LabInstance);
  }

  public update(entity: Partial<LabInstance>): Observable<LabInstance>{
    return this.apiService.put(this.route, entity, LabInstance);
  }

  public getCurrentLabInstance(): Observable<LabInstance[]> {
    return this.apiService.get(this.route + '/current', LabInstance);
  }

  /**
   * Return the list of the current user's projects
   */
  public getCurrentLabInstancesDatasource(): LabInstanceDatasource {
    return new EntityPaginatedDatasource(this.getCurrentLabInstanceMethod(), 20);
  }

  /**
   * Return the list of the 4 first lab instance for a user
   */
  public getDashboardCurrentLabInstancesDatasource(): LabInstanceDatasource {
    return new EntityPaginatedDatasource(this.getCurrentLabInstanceMethod(), 4);
  }

  private getCurrentLabInstanceMethod(): GetPageFunction<LabInstance> {
    return (page: number, pageSize: number): Observable<Page<LabInstance>> => this.apiService.get(`${this.route}/current`, LabInstance,
      {resultIsPaginated: true, page: page, pageSize: pageSize});
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

  public getStatusHistories(id: string): ArrayObs<LabInstanceStatusHistory> {
    return new EntityArrayObs(this.apiService.get(`${this.route}/${id}/status-history`, LabInstanceStatusHistory));
  }

  /**
   * Log the user to the lab instance and return the authentication in the cookie
   */
  public logUserToLab(id: string): Observable<LabInstanceToken> {
    return this.apiService.post(`${this.route}/${id}/login`, null, LabInstanceToken);
  }

  public getAll(): ArrayObs<LabInstance> {
    return new EntityArrayObs(this.apiService.get(this.route, LabInstance));
  }
}
