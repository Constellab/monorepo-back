import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {
  CaLabInstance,
  CaLabInstanceDatasource,
  CaLabInstanceStatusHistory,
  CaLabInstanceUser,
  CaLabInstanceUserForm
} from '../model/entities/ca-lab-instance.class';
import {FlApiService, FlArrayObs, FlEntityArrayObs, FlEntityPaginatedDatasource} from '@monorepo/front-core-lib';
import {ClGetPageFunction, ClPageI} from '@monorepo/core-lib';
import {
  CaLabComposeUpOptions,
  CaLabDockerPs,
  CaLabTaskStatusInfo,
  CnLabManagerStatus
} from '../model/entities/ca-lab-manager.class';

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
  public logUserToLab(id: string): Observable<{ url: string }> {
    return this.apiService.get(`${this.route}/${id}/login`);
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

  //////////////////////////// LAB MANAGER ////////////////////////////////

  public getLabManagerStatus(id: string): Observable<CnLabManagerStatus> {
    return this.apiService.get(`${this.route}/${id}/status`, CnLabManagerStatus);
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
}
