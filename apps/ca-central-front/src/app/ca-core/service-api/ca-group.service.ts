import {Injectable} from '@angular/core';
import {FlApiService, FlEntityPaginatedDatasource} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {CaGroup, CaGroupDatasource} from '../model/entities/ca-group.entity';
import {ClPage, ClPageI} from '@monorepo/core-lib';
import {CaUser, CaUserDatasourcePaginated} from '../model/entities/ca-user.class';

@Injectable({
  providedIn: 'root'
})
export class CaGroupService {

  private readonly route = 'groups';

  constructor(private apiService: FlApiService) {
  }

  public getTeamById(id: string): Observable<CaGroup> {
    return this.apiService.getById(this.route, id, CaGroup);
  }

  public getCurrentAllTeams(): Observable<CaGroup[]> {
    return this.apiService.get(`${this.route}/all-current`);
  }

  /**
   * Return the list of the current user's teams
   */
  public getMyTeamsDatasource(pageSize: number): CaGroupDatasource {
    return new FlEntityPaginatedDatasource(
      (page: number, pageSize: number) => this.getCurrentTeams(page, pageSize),
      pageSize);
  }


  private getCurrentTeams(page: number, pageSize: number): Observable<ClPageI<CaGroup>> {
    return this.apiService.get(`${this.route}/current`, CaGroup,
      {resultIsPaginated: true, page: page, pageSize: pageSize});
  }

  public getByCurrentOrganizationDatasource(): CaGroupDatasource {
    return new FlEntityPaginatedDatasource(
      (page, size) => this.getByCurrentOrganization(page, size), 20);
  }

  public getByCurrentOrganization(page: number, pageSize: number): Observable<ClPageI<CaGroup>>{
    return this.apiService.get(`${this.route}/current-organization`, CaGroup,
      {resultIsPaginated: true, page: page, pageSize: pageSize});
  }

  public createTeam(label: string): Observable<CaGroup> {
    return this.apiService.post(`${this.route}/${label}`, null, CaGroup);
  }

  public updateTeamLabel(groupId: string, label: string): Observable<CaGroup> {
    return this.apiService.put(`${this.route}/${groupId}/label/${label}`, null, CaGroup);
  }

  public addUserToTeam(groupId: string, userId: string): Observable<CaUser> {
    return this.apiService.post(`${this.route}/${groupId}/add-user/${userId}`, null, CaUser);
  }

  public removeUserFromTeam(groupId: string, userId: string): Observable<void> {
    return this.apiService.delete(`${this.route}/${groupId}/remove-user/${userId}`, null);
  }

  public deleteTeamById(groupId: string): Observable<void> {
    return this.apiService.delete(`${this.route}/${groupId}`);
  }

  public getUsersOfTeam(groupId: string, page: number, size: number): Observable<ClPage<CaUser>> {
    return this.apiService.get(`${this.route}/${groupId}/users`, CaUser,
      {page: page, pageSize: size, resultIsPaginated: true});
  }

  public getUsersOfTeamDatasource(groupId: string): CaUserDatasourcePaginated {
    return new FlEntityPaginatedDatasource(
      (page, size) => this.getUsersOfTeam(groupId, page, size), 20);
  }
}
