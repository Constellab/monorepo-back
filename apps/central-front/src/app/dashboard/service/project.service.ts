import {Injectable} from '@angular/core';
import {ApiCrudService} from '../../core/service-api/api-crud.service';
import {Project, ProjectDatasource, ProjectStatus, ProjectStatusHistory} from '../../core/model/entities/project.class';
import {ApiService} from '../../core/service-api/api.service';
import {Observable} from 'rxjs';
import {FlArrayObs, FlEntityArrayObs, FlEntityPaginatedDatasource, FlGetPageFunction} from '@monorepo/front-core-lib';

/**
 * Service to manage project entity
 */
@Injectable({
  providedIn: 'root'
})
export class ProjectService extends ApiCrudService<Project, Partial<Project>> {

  constructor(apiService: ApiService) {
    super('projects', Project, apiService);
  }

  /**
   * Return the list of the current user's projects
   */
  public getMyProjectsDatasource(): ProjectDatasource {
    return new FlEntityPaginatedDatasource(this.getMyProjectsMethod(), 20);
  }

  /**
   * Return the list of the 4 first project for a user
   */
  public getDashboardMyProjectsDatasource(): ProjectDatasource {
    return new FlEntityPaginatedDatasource(this.getMyProjectsMethod(), 4);
  }

  private getMyProjectsMethod(): FlGetPageFunction<Project> {
    return (page: number, pageSize: number) => this.apiService.get(`${this.route}/current`, Project,
      {resultIsPaginated: true, page: page, pageSize: pageSize});
  }

  // use to pass the updateStatus method to UpdateStatusFormDialog
  public getUpdateStatusMethod(id: string): (status: ProjectStatus) => Observable<Project> {
    return (status => this.updateStatus(id, status));
  }

  public updateStatus(id: string, status: ProjectStatus): Observable<Project> {
    return this.apiService.put(`${this.route}/${id}/status/${status}`,
      null, Project);
  }

  public getStatusHistories(id: string): FlArrayObs<ProjectStatusHistory> {
    return new FlEntityArrayObs(this.apiService.get(`${this.route}/${id}/status-history`, ProjectStatusHistory));
  }
}
