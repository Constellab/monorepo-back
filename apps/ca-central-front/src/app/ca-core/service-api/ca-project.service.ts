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
  FlAdvancedSearchInput,
  FlApiService,
  FlArrayObs,
  FlEntityArrayObs,
  FlEntityPaginatedDatasource,
  FlQuillJson,
  FlSearchConverter,
  FlTextEditorUploadedImage,
} from '@monorepo/front-core-lib';
import {ClPage, ClPageI} from '@monorepo/core-lib';
import {CaGroup} from '../model/entities/ca-group.entity';
import {CaUser} from '../model/entities/ca-user.class';
import {CaProjectComment, CaProjectCommentDatasourcePaginated} from '../model/entities/ca-comment.class';
import {CmRichTextI} from '@monorepo/common-model';
import {map} from 'rxjs/operators';
import {CaProjectSearch, CaProjectSearchFields} from '../entity-module/ca-project-core/model/ca-project-search.class';
import {CaBucket, CaBucketFull} from '../model/entities/ca-object-storage.class';
import {CaCloudProviderRegion} from '../model/entities/ca-cloud-provider.class';

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

  public delete(id: string): Observable<void> {
    return this.apiService.deleteById(this.route, id);
  }

  public getById(id: string): Observable<CaProject> {
    return this.apiService.getById(this.route, id, CaProject);
  }

  public getMyProjectsDatasource(pageSize: number = 20): CaProjectDatasource {
    return new FlEntityPaginatedDatasource(
      (page, size) => this.getMyProjects(page, size), pageSize);
  }

  private getMyProjects(page: number, pageSize: number): Observable<ClPageI<CaProject>> {
    return this.apiService.get(`${this.route}/current`, CaProject,
      {resultIsPaginated: true, page: page, pageSize: pageSize});
  }

  public getProjectByCurrentSpaceDatasource(): CaProjectDatasource {
    return new FlEntityPaginatedDatasource(
      (page, pageSize) => this.getProjectByCurrentSpace(page, pageSize),
      20);
  }

  public getProjectByCurrentSpace(page: number, size: number): Observable<ClPageI<CaProject>> {
    return this.apiService.get(`${this.route}/current-space`, CaProject,
      {resultIsPaginated: true, page: page, pageSize: size});
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

  public searchInCurrentSpace(page: number, pageSize: number, filters?: CaProjectSearchFields): Observable<ClPageI<CaProject>> {
    const data: FlAdvancedSearchInput = {
      filtersCriteria: FlSearchConverter.convertObjectToSearchCriteriaList(filters, CaProjectSearch.advancedSearchConverter),
      sortsCriteria: null
    };
    return this.apiService.post(`${this.route}/current-space/search`, data, CaProject, {
      page: page, pageSize: pageSize, resultIsPaginated: true
    });
  }

  /////////////////////////////// COMMENTS //////////////////////////////////
  public getProjectComments(userId: string): CaProjectCommentDatasourcePaginated {
    return new FlEntityPaginatedDatasource(
      (page, size) => this.getAll(userId, page, size), 20);
  }

  public getAll(projectId: string, page: number, size: number): Observable<ClPage<CaProjectComment>> {
    return this.apiService.get(`${this.route}/${projectId}/comments`, CaProjectComment,
      {page: page, pageSize: size, resultIsPaginated: true});
  }

  public newProjectComment(projectId: string, content: CmRichTextI, parentCommentId?: string): Observable<CaProjectComment> {
    return this.apiService.post(`${this.route}/${projectId}/comment`,
      {content: content, parentCommentId: parentCommentId}, CaProjectComment);
  }

  public editProjectComment(projectId: string, commentId: string, content: CmRichTextI): Observable<CaProjectComment> {
    return this.apiService.put(`${this.route}/${projectId}/comment/${commentId}`,
      {content: content}, CaProjectComment);
  }

  public deleteProjectComment(projectId: string, commentId: string): Observable<CaProjectComment> {
    return this.apiService.post(`${this.route}/${projectId}/comment/${commentId}/delete`, null, CaProjectComment);
  }

  uploadCommentImage(file: File, projectId: string): Observable<FlTextEditorUploadedImage> {
    const formData = new FormData();
    formData.append('file', file);
    return this.apiService.put(`${this.route}/${projectId}/comment/image`, formData).pipe(
      map(
        (uploadedFile: any) => {
          return {
            filename: uploadedFile.filename,
            width: uploadedFile.width,
            height: uploadedFile.height,
          };
        }
      )
    );
  }

  public getCommentImageUrl(filename: string, projectId: string): string {
    return this.apiService.getBaseRouteUrl(`${this.route}/${projectId}/comment/image/${filename}`);
  }



  /////////////////////////////// Project Bucket ///////////////////////////////////////////
  public getProjectBucket(projectId: string): Observable<CaBucketFull | null> {
    return this.apiService.get(`${this.route}/${projectId}/bucket`, CaBucketFull);
  }

  public createProjectBucket(projectId: string, region: CaCloudProviderRegion): Observable<CaBucket> {
    return this.apiService.post(`${this.route}/${projectId}/bucket`, region, CaBucket);
  }
}
