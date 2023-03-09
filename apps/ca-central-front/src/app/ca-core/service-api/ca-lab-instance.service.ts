import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {
  CaLabInstance,
  CaLabInstanceAdminForm,
  CaLabInstanceDatasource,
  CaLabInstanceFindOneDto,
  CaLabInstanceOnPremiseConfig,
  CaLabInstanceOnPremiseForm,
  CaLabInstanceStatusDTO,
  CaLabInstanceStatusHistory,
  CaLabInstanceWithSpace,
  CaRequestLabInstance
} from '../model/entities/lab/ca-lab-instance.class';
import {
  FlAdvancedSearchInput,
  FlApiService,
  FlArrayObs,
  FlEntityArrayObs,
  FlEntityPaginatedDatasource,
  FlSearchConverter
} from '@monorepo/front-core-lib';
import {ClPage, ClPageI} from '@monorepo/core-lib';
import {
  CaExternalLabBackup,
  CaExternalLabBackupHistory,
  CaLabComposeRestartOptions,
  CaLabComposeUpOptions,
  CaLabDockerPs,
  CaLabManagerConfig,
  CaLabManagerStatus,
  CaLabTaskStatusInfo
} from '../model/entities/lab/ca-lab-manager.class';
import {CaLabInstanceUser, CaLabInstanceUserRole} from '../model/entities/lab/ca-lab-instance-user.class';
import {CaLabInstanceProject} from '../model/entities/lab/ca-lab-instance-project.class';
import {
  CaLabInstanceSearch,
  CaLabInstanceSearchFields
} from '../entity-module/ca-lab-core/model/ca-lab-instance-search.class';
import {CaServerCompleteInfo} from '../model/entities/lab/ca-lab-server.class';
import {CaLabConfig} from '../model/entities/lab/ca-lab-config.class';

@Injectable({
  providedIn: 'root'
})
export class CaLabInstanceService {

  private readonly route: string = 'lab-instances';

  constructor(private apiService: FlApiService) {
  }

  public createAdmin(entity: CaLabInstanceAdminForm): Observable<CaLabInstanceWithSpace> {
    return this.apiService.post(`${this.route}/admin`, entity, CaLabInstanceWithSpace,
      {serialization: CaLabInstanceAdminForm});
  }

  public updateAdmin(entity: CaLabInstanceAdminForm): Observable<CaLabInstanceWithSpace> {
    return this.apiService.put(`${this.route}/admin`, entity, CaLabInstanceWithSpace, {serialization: CaLabInstanceAdminForm});
  }

  public createOnPremiseLab(entity: CaLabInstanceOnPremiseForm): Observable<CaLabInstance> {
    return this.apiService.post(`${this.route}/on-premise`, entity, CaLabInstance);
  }

  public updateLab(entity: CaLabInstanceAdminForm): Observable<CaLabInstance> {
    return this.apiService.put(`${this.route}`, entity, CaLabInstance);
  }

  public delete(id: string): Observable<CaLabInstance> {
    return this.apiService.deleteById(this.route, id, CaLabInstance);
  }

  public requestNewLabInstance(request: CaRequestLabInstance): Observable<CaLabInstance> {
    return this.apiService.post(this.route + '/request-lab-instance', request, CaLabInstance);
  }

  public getCurrentLabInstancesDatasource(pageSize: number = 20): CaLabInstanceDatasource {
    return new FlEntityPaginatedDatasource(
      (page, size) => this.getCurrentLabInstance(page, size), pageSize);
  }

  private getCurrentLabInstance(page: number, pageSize: number): Observable<ClPageI<CaLabInstance>> {
    return this.apiService.get(`${this.route}/current`, CaLabInstance,
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


  public findById(id: string): Observable<CaLabInstanceFindOneDto> {
    return this.apiService.get(`${this.route}/${id}`, CaLabInstanceFindOneDto);
  }

  /**
   * Log the user to the lab instance and return the authentication in the cookie
   */
  public logUserToLab(id: string): Observable<{ url: string }> {
    return this.apiService.get(`${this.route}/${id}/login`);
  }

  public searchAll(page: number, pageSize: number,
                   filters?: CaLabInstanceSearchFields): Observable<ClPage<CaLabInstanceWithSpace>> {
    const data: FlAdvancedSearchInput = {
      filtersCriteria: FlSearchConverter.convertObjectToSearchCriteriaList(filters, CaLabInstanceSearch.advancedSearchConverter),
      sortsCriteria: null
    };
    return this.apiService.post(`${this.route}/search`, data, CaLabInstanceWithSpace, {
      page: page, pageSize: pageSize, resultIsPaginated: true
    });
  }

  public searchInCurrentSpace(page: number, pageSize: number,
                              filters?: CaLabInstanceSearchFields): Observable<ClPage<CaLabInstance>> {
    const data: FlAdvancedSearchInput = {
      filtersCriteria: FlSearchConverter.convertObjectToSearchCriteriaList(filters, CaLabInstanceSearch.advancedSearchConverter),
      sortsCriteria: null
    };
    return this.apiService.post(`${this.route}/current-space/search`, data, CaLabInstanceWithSpace, {
      page: page, pageSize: pageSize, resultIsPaginated: true
    });
  }

  public checkStatus(id: string): Observable<any> {
    return this.apiService.get(`${this.route}/${id}/check-status`);
  }

  public getConfig(id: string, hideSnackBarError: boolean = false): Observable<CaLabConfig> {
    return this.apiService.get(`${this.route}/${id}/config`, CaLabConfig, {hideSnackBarError});
  }

  public updateConfig(id: string, config: CaLabManagerConfig): Observable<void> {
    return this.apiService.put(`${this.route}/${id}/config`, config, CaLabManagerConfig);
  }

  //////////////////////////// STATUS ////////////////////////////////
  public getStatus(id: string): Observable<CaLabInstanceStatusDTO> {
    return this.apiService.get(`${this.route}/${id}/status`, CaLabInstanceStatusDTO);
  }

  public refreshStatus(id: string): Observable<CaLabInstanceStatusDTO> {
    return this.apiService.put(`${this.route}/${id}/status/refresh`, null, CaLabInstanceStatusDTO);
  }

  public getStatusHistories(id: string): FlArrayObs<CaLabInstanceStatusHistory> {
    return new FlEntityArrayObs(this.apiService.get(`${this.route}/${id}/status/history`, CaLabInstanceStatusHistory));
  }

  //////////////////////////// USERS ////////////////////////////////
  public addUserToLab(labId: string, userId: string, role: CaLabInstanceUserRole): Observable<CaLabInstanceUser> {
    return this.apiService.post(`${this.route}/${labId}/user/${userId}/${role}`, null,
      CaLabInstanceUser);
  }

  public updateUserLabRole(labId: string, userId: string, role: CaLabInstanceUserRole): Observable<CaLabInstanceUser> {
    return this.apiService.put(`${this.route}/${labId}/user/${userId}/${role}`, null,
      CaLabInstanceUser);
  }

  public removeUserFromLab(labId: string, userId: string): Observable<CaLabInstanceUser> {
    return this.apiService.delete(`${this.route}/${labId}/user/${userId}`, CaLabInstanceUser);
  }

  public getLabInstanceUsers(labId: string): Observable<CaLabInstanceUser[]> {
    return this.apiService.get(`${this.route}/${labId}/user`, CaLabInstanceUser);
  }

  //////////////////////////// PROJECT ////////////////////////////////

  public addProjectToLab(labId: string, projectId: string): Observable<CaLabInstanceProject> {
    return this.apiService.post(`${this.route}/${labId}/project/${projectId}`, null,
      CaLabInstanceProject);
  }

  public removeProjectFromLab(labId: string, projectId: string): Observable<CaLabInstanceProject> {
    return this.apiService.delete(`${this.route}/${labId}/project/${projectId}`, CaLabInstanceProject);
  }

  public getLabInstanceProjects(labId: string): Observable<CaLabInstanceProject[]> {
    return this.apiService.get(`${this.route}/${labId}/project`, CaLabInstanceProject);
  }

  //////////////////////////// LAB MANAGER ////////////////////////////////

  public updateLabManager(id: string, version: string): Observable<CaLabInstanceStatusDTO> {
    return this.apiService.put(`${this.route}/${id}/lab-manager/update/${version}`, null, CaLabInstanceStatusDTO);
  }

  public getLabManagerStatus(id: string): Observable<CaLabManagerStatus> {
    return this.apiService.get(`${this.route}/${id}/lab-manager/status`, CaLabManagerStatus);
  }

  public getCurrentTask(id: string): Observable<CaLabTaskStatusInfo> {
    return this.apiService.get(`${this.route}/${id}/lab-manager/current-task`);
  }

  public listContainers(id: string): Observable<CaLabDockerPs[]> {
    return this.apiService.get(`${this.route}/${id}/lab-manager/containers`, CaLabDockerPs);
  }

  public getLogs(id: string, containerName: string): Observable<string> {
    return this.apiService.get(`${this.route}/${id}/lab-manager/${containerName}/logs`, null,
      {responseType: 'text'});
  }

  public initAll(id: string): Observable<void> {
    return this.apiService.post(`${this.route}/${id}/lab-manager/init-all`, null);
  }

  public upContainers(id: string, options: CaLabComposeUpOptions): Observable<void> {
    return this.apiService.post(`${this.route}/${id}/lab-manager/up-containers`, options);
  }

  public restartContainers(id: string, options: CaLabComposeRestartOptions): Observable<void> {
    return this.apiService.post(`${this.route}/${id}/lab-manager/restart-containers`, options);
  }

  public downContainers(id: string): Observable<void> {
    return this.apiService.post(`${this.route}/${id}/lab-manager/down-containers`, null);
  }

  public pullContainers(id: string): Observable<void> {
    return this.apiService.post(`${this.route}/${id}/lab-manager/pull-containers`, null);
  }

  public pullBiotaDb(id: string): Observable<void> {
    return this.apiService.post(`${this.route}/${id}/lab-manager/pull-biota-db`, null);
  }

  public registryLogin(id: string): Observable<void> {
    return this.apiService.post(`${this.route}/${id}/lab-manager/registry-login`, null);
  }

  public stopCurrentTask(id: string): Observable<void> {
    return this.apiService.post(`${this.route}/${id}/lab-manager/stop-current-task`, null);
  }

  public systemPrune(id: string): Observable<void> {
    return this.apiService.post(`${this.route}/${id}/lab-manager/system-prune`, null);
  }

  public getLabManagerConfig(id: string): Observable<CaLabManagerConfig> {
    return this.apiService.get(`${this.route}/${id}/lab-manager/config`, CaLabManagerConfig);
  }

  public startAdminer(id: string): Observable<boolean> {
    return this.apiService.put(`${this.route}/${id}/lab-manager/adminer/start`, null);
  }

  public stopAdminer(id: string): Observable<boolean> {
    return this.apiService.put(`${this.route}/${id}/lab-manager/adminer/stop`, null);
  }

  //////////////////////////// BACKUP ////////////////////////////////

  public backupProd(id: string): Observable<CaExternalLabBackup> {
    return this.apiService.post(`${this.route}/${id}/backup/prod`, CaExternalLabBackup);
  }

  public stopCurrentBackup(id: string): Observable<void> {
    return this.apiService.post(`${this.route}/${id}/backup/stop-current`, null);
  }

  public getBackupCurrentStatus(id: string): Observable<CaExternalLabBackup> {
    return this.apiService.get(`${this.route}/${id}/backup/current-status`, CaExternalLabBackup);
  }

  public getBackupHistory(id: string): Observable<CaExternalLabBackupHistory> {
    return this.apiService.get(`${this.route}/${id}/backup/history`, CaExternalLabBackupHistory);
  }

  //////////////////////////// SERVER ////////////////////////////////

  public getServerInfo(id: string): Observable<CaServerCompleteInfo> {
    return this.apiService.get(`${this.route}/${id}/server/info`, CaServerCompleteInfo);
  }

  public initServer(id: string): Observable<CaLabInstanceStatusDTO> {
    return this.apiService.post(`${this.route}/${id}/server/init`, null, CaLabInstanceStatusDTO);
  }

  public createServer(id: string): Observable<CaLabInstanceStatusDTO> {
    return this.apiService.post(`${this.route}/${id}/server/create`, null, CaLabInstanceStatusDTO);
  }

  public configureServer(id: string): Observable<CaLabInstanceStatusDTO> {
    return this.apiService.post(`${this.route}/${id}/server/configure`, null, CaLabInstanceStatusDTO);
  }

  public deleteServer(id: string): Observable<void> {
    return this.apiService.delete(`${this.route}/${id}/server`);
  }

  public updateDockerlabRepository(id: string): Observable<CaLabInstanceStatusDTO> {
    return this.apiService.put(`${this.route}/${id}/dockerlab/update`, null, CaLabInstanceStatusDTO);
  }

  //////////////////////////// ON PREMISE ////////////////////////////////

  public getOnPremiseConfigDownloadUrl(id: string, config: CaLabInstanceOnPremiseConfig): Observable<Blob> {
    return this.apiService.post(
      `${this.route}/${id}/on-premise/generate-config`, config, null,
      {responseType: 'blob'});
  }
}
