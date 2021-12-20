import {Injectable} from '@angular/core';
import {
  CaProject,
  CaProjectDatasource,
  CaProjectStatus,
  CaProjectStatusHistory
} from '../model/entities/ca-project.class';
import {Observable} from 'rxjs';
import {FlApiService, FlArrayObs, FlEntityArrayObs, FlEntityPaginatedDatasource,} from '@monorepo/front-core-lib';
import {ClGetPageFunction} from '@monorepo/core-lib';

/**
 * Service to manage project entity
 */
@Injectable({
  providedIn: 'root'
})
export class CaProjectService {

  private readonly route: string = 'projects';

  constructor(private apiService: FlApiService) {
  }

  /**
   * Call http create
   * @param object json object
   */
  public create(object: Partial<CaProject>): Observable<CaProject> {
    return this.apiService.post(this.route, object, CaProject, {serialization: CaProject});
  }


  /**
   * Call http update
   * @param object json object
   */
  public update(object: Partial<CaProject>): Observable<CaProject> {
    return this.apiService.put(this.route, object, CaProject, {serialization: CaProject});
  }

  /**
   * Call a http get one by id
   * @param id id of the entity
   */
  public getById(id: string): Observable<CaProject> {
    return this.apiService.getById(this.route, id, CaProject);
  }

  /**
   * Return the list of the current user's projects
   */
  public getMyProjectsDatasource(): CaProjectDatasource {
    return new FlEntityPaginatedDatasource(this.getMyProjectsMethod(), 20);
  }

  /**
   * Return the list of the 4 first project for a user
   */
  public getDashboardMyProjectsDatasource(): CaProjectDatasource {
    return new FlEntityPaginatedDatasource(this.getMyProjectsMethod(), 4);
  }

  private getMyProjectsMethod(): ClGetPageFunction<CaProject> {
    return (page: number, pageSize: number) => this.apiService.get(`${this.route}/current`, CaProject,
      {resultIsPaginated: true, page: page, pageSize: pageSize});
  }

  // use to pass the updateStatus method to UpdateStatusFormDialog
  public getUpdateStatusMethod(id: string): (status: CaProjectStatus) => Observable<CaProject> {
    return (status => this.updateStatus(id, status));
  }

  public updateStatus(id: string, status: CaProjectStatus): Observable<CaProject> {
    return this.apiService.put(`${this.route}/${id}/status/${status}`,
      null, CaProject);
  }

  public getStatusHistories(id: string): FlArrayObs<CaProjectStatusHistory> {
    return new FlEntityArrayObs(this.apiService.get(`${this.route}/${id}/status-history`, CaProjectStatusHistory));
  }
}
