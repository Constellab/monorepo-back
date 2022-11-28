import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {
  CaLabInstance,
  CaLabInstanceDatasource,
  CaLabInstanceFindOneDto,
  CaLabInstanceForm,
  CaLabInstanceStatusHistory,
  CaLabInstanceWithOrga,
  CaLabInstanceWithOrgaDatasource
} from '../model/entities/ca-lab-instance.class';
import {FlApiService, FlArrayObs, FlEntityArrayObs, FlEntityPaginatedDatasource} from '@monorepo/front-core-lib';
import {ClPageI} from '@monorepo/core-lib';
import {
  CaExternalLabBackup,
  CaExternalLabBackupHistory,
  CaLabComposeUpOptions,
  CaLabDockerPs,
  CaLabInstanceConfig,
  CaLabManagerStatus,
  CaLabTaskStatusInfo
} from '../model/entities/ca-lab-manager.class';
import {CaLabInstanceUser, CaLabInstanceUserRole} from '../model/entities/ca-lab-instance-user.class';
import {CaLabInstanceProject} from '../model/entities/ca-lab-instance-project.class';

@Injectable({
  providedIn: 'root'
})
export class CaLabInstanceService {

  private readonly route: string = 'lab-instances';

  constructor(private apiService: FlApiService) {
  }

  public create(entity: CaLabInstanceForm): Observable<CaLabInstanceWithOrga> {
    return this.apiService.post(this.route, entity, CaLabInstanceWithOrga, {serialization: CaLabInstanceForm});
  }

  public update(entity: CaLabInstanceForm): Observable<CaLabInstanceWithOrga> {
    return this.apiService.put(this.route, entity, CaLabInstanceWithOrga, {serialization: CaLabInstanceForm});
  }

  public delete(id: string): Observable<CaLabInstance> {
    return this.apiService.deleteById(this.route, id, CaLabInstance);
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

  public getStatusHistories(id: string): FlArrayObs<CaLabInstanceStatusHistory> {
    return new FlEntityArrayObs(this.apiService.get(`${this.route}/${id}/status-history`, CaLabInstanceStatusHistory));
  }

  /**
   * Log the user to the lab instance and return the authentication in the cookie
   */
  public logUserToLab(id: string): Observable<{ url: string }> {
    return this.apiService.get(`${this.route}/${id}/login`);
  }

  public getAll(page: number, size: number): Observable<ClPageI<CaLabInstanceWithOrga>> {
    return this.apiService.get(this.route, CaLabInstanceWithOrga,
      {page: page, pageSize: size, resultIsPaginated: true});
  }

  public getAllDatasource(): CaLabInstanceWithOrgaDatasource {
    return new FlEntityPaginatedDatasource(
      (page, size) => this.getAll(page, size), 20
    );
  }


  public updateName(id: string, name: string): Observable<CaLabInstance> {
    return this.apiService.put(`${this.route}/${id}/name/${name}`, null, CaLabInstance);
  }

  public checkStatus(id: string): Observable<any> {
    return this.apiService.get(`${this.route}/${id}/check-status`);
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

  public getLabManagerStatus(id: string): Observable<CaLabManagerStatus> {
    return this.apiService.get(`${this.route}/${id}/status`, CaLabManagerStatus);
  }

  public getCurrentTask(id: string): Observable<CaLabTaskStatusInfo> {
    return this.apiService.get(`${this.route}/${id}/current-task`);
  }

  public listContainers(id: string): Observable<CaLabDockerPs[]> {
    return this.apiService.get(`${this.route}/${id}/containers`, CaLabDockerPs);
  }

  public getLogs(id: string, containerName: string): Observable<string> {
    return this.apiService.get(`${this.route}/${id}/${containerName}/logs`, null,
      {responseType: 'text'});
  }

  public initAll(id: string): Observable<void> {
    return this.apiService.post(`${this.route}/${id}/init-all`, null);
  }

  public upContainers(id: string, options: CaLabComposeUpOptions): Observable<void> {
    return this.apiService.post(`${this.route}/${id}/up-containers`, options);
  }

  public restartContainers(id: string, options: CaLabComposeUpOptions): Observable<void> {
    return this.apiService.post(`${this.route}/${id}/restart-containers`, options);
  }

  public downContainers(id: string): Observable<void> {
    return this.apiService.post(`${this.route}/${id}/down-containers`, null);
  }

  public pullContainers(id: string): Observable<void> {
    return this.apiService.post(`${this.route}/${id}/pull-containers`, null);
  }

  public pullBiotaDb(id: string): Observable<void> {
    return this.apiService.post(`${this.route}/${id}/pull-biota-db`, null);
  }

  public registryLogin(id: string): Observable<void> {
    return this.apiService.post(`${this.route}/${id}/registry-login`, null);
  }

  public stopCurrentTask(id: string): Observable<void> {
    return this.apiService.post(`${this.route}/${id}/stop-current-task`, null);
  }

  public systemPrune(id: string): Observable<void> {
    return this.apiService.post(`${this.route}/${id}/system-prune`, null);
  }

  public updateConfig(id: string, config: CaLabInstanceConfig): Observable<void> {
    return this.apiService.put(`${this.route}/${id}/config`, config, CaLabInstanceConfig);
  }

  public getConfig(id: string): Observable<CaLabInstanceConfig> {
    return this.apiService.get(`${this.route}/${id}/config`, CaLabInstanceConfig);
  }

  public startAdminer(id: string): Observable<boolean> {
    return this.apiService.put(`${this.route}/${id}/adminer/start`, null);
  }

  public stopAdminer(id: string): Observable<boolean> {
    return this.apiService.put(`${this.route}/${id}/adminer/stop`, null);
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
}
