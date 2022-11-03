import {Injectable} from '@angular/core';
import {
  CaProject,
  CaProjectAncestorTreeDTO,
  CaProjectAncestorType,
  CaProjectDatasource,
  CaProjectStatus,
  CaProjectStatusHistory,
  CaProjectTreeDto
} from '../model/entities/ca-project.class';
import {Observable} from 'rxjs';
import {
  FlApiService,
  FlArrayObs,
  FlEntityArrayObs,
  FlEntityPaginatedDatasource,
  FlQuillJson,
} from '@monorepo/front-core-lib';
import {ClGetPageFunction, ClPage, ClPageI} from '@monorepo/core-lib';
import {CaGroup} from '../model/entities/ca-group.entity';
import {CaUser} from '../model/entities/ca-user.class';
import {CaProjectComment, CaProjectCommentDatasourcePaginated} from '../model/entities/ca-comment.class';
import {CmRichTextI} from '@monorepo/common-model';

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

  public createProject(project: Partial<CaProject>): Observable<CaProject> {
    return this.apiService.post(this.route, project, CaProject, {serialization: CaProject});
  }

  public createSubProject(subProject: Partial<CaProject>, parentProjectId: string): Observable<CaProject> {
    return this.apiService.post(`${this.route}/${parentProjectId}/sub-project`, subProject, CaProject,
      {serialization: CaProject});
  }


  public update(object: Partial<CaProject>): Observable<CaProject> {
    return this.apiService.put(this.route, object, CaProject, {serialization: CaProject});
  }

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

  public getProjectSharedGroups(id: string): Observable<CaGroup[]> {
    return this.apiService.get(`${this.route}/${id}/shared-groups`, CaGroup);
  }

  public shareProject(id: string, groupId: string): Observable<CaGroup> {
    return this.apiService.put(`${this.route}/${id}/share/${groupId}`, null, CaGroup);
  }

  public unshareProject(id: string, groupId: string): Observable<void> {
    return this.apiService.delete(`${this.route}/${id}/unshare/${groupId}`);
  }

  public getProjectsByTeam(groupId: string, page: number, size: number): Observable<ClPageI<CaProject>> {
    return this.apiService.get(`${this.route}/group/${groupId}`, CaProject,
      {resultIsPaginated: true, page: page, pageSize: size});
  }

  public getProjectsByTeamDatasource(groupId: string): CaProjectDatasource {
    return new FlEntityPaginatedDatasource((page: number, pageSize: number) => this.getProjectsByTeam(groupId, page, pageSize), 20);
  }

  public getOnGoingProjectsNumber(): Observable<number> {
    return this.apiService.get(`${this.route}/on-going-projects-number`);
  }

  public getChildren(id: string): Observable<CaProject[]> {
    return this.apiService.get(`${this.route}/${id}/children`, CaProject);
  }

  public getObjectProjectAncestors(objectType: CaProjectAncestorType, objectId: string): Observable<CaProjectAncestorTreeDTO[]> {
    return this.apiService.get(`${this.route}/ancestors/${objectType}/${objectId}`);
  }

  public getUsersOfProject(projectId: string): Observable<CaUser[]> {
    return this.apiService.get(`${this.route}/${projectId}/users`, CaUser);
  }

  public updateDescription(id: string, description: string): Observable<CaProject> {
    return this.apiService.put(`${this.route}/${id}/description`, description, CaProject);
  }

  public updateProjectLeader(id: string, userId: string): Observable<CaProject> {
    return this.apiService.put(`${this.route}/${id}/leader/${userId}`, null, CaProject);
  }

  public getProjectDescription(id: string): Observable<FlQuillJson> {
    return this.apiService.get(`${this.route}/${id}/description`);
  }

  public getProjectTree(objectType: CaProjectAncestorType, objectId: string): Observable<CaProjectTreeDto> {
    return this.apiService.get(`${this.route}/tree/${objectType}/${objectId}`);
  }

  /////////////////////////////// COMMENTS //////////////////////////////////
  public getProjectComments(userId: string): CaProjectCommentDatasourcePaginated {
    return new FlEntityPaginatedDatasource(
      (page, size) => this.getAll(userId, page, size), 20);
  }

  public getAll(projectId: string, page: number, size: number): Observable<ClPage<CaProjectComment>> {
    return this.apiService.get(`${this.route}/comments/${projectId}`, CaProjectComment,
      {page: page, pageSize: size, resultIsPaginated: true});
  }

  public newProjectComment(projectId: string, content: CmRichTextI, parentCommentId?: string): Observable<CaProjectComment>{
    return this.apiService.post(`${this.route}/new-comment/${projectId}`,
      {content: content, parentCommentId: parentCommentId}, CaProjectComment);
  }
}
