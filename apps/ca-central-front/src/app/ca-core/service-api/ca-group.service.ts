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
  private readonly teamRoute = this.route + '/teams';

  constructor(private apiService: FlApiService) {
  }

  public getAllCurrentGroups(page: number, size: number): Observable<ClPageI<CaGroup>> {
    return this.apiService.get(`${this.route}/all-current`, CaGroup,
      {page: page, pageSize: size, resultIsPaginated: true});
  }

  public getAllCurrentGroupsDatasource(): CaGroupDatasource {
    return new FlEntityPaginatedDatasource(
      (page, size) => this.getAllCurrentGroups(page, size), 20);
  }


  ///////////////////////////// TEAMS ////////////////////////////////////

  public getTeamById(id: string): Observable<CaGroup> {
    return this.apiService.getById(this.teamRoute, id, CaGroup);
  }

  /**
   * Return the list of the current user's teams
   */
  public getMyTeamsDatasource(pageSize: number = 20): CaGroupDatasource {
    return new FlEntityPaginatedDatasource(
      (page: number, pageSize: number) => this.getMyTeams(page, pageSize),
      pageSize);
  }

  private getMyTeams(page: number, pageSize: number): Observable<ClPageI<CaGroup>> {
    return this.apiService.get(`${this.teamRoute}/current`, CaGroup,
      {resultIsPaginated: true, page: page, pageSize: pageSize});
  }

  public getByCurrentSpaceDatasource(): CaGroupDatasource {
    return new FlEntityPaginatedDatasource(
      (page, size) => this.getTeamsByCurrentSpace(page, size), 20);
  }

  public getTeamsByCurrentSpace(page: number, pageSize: number): Observable<ClPageI<CaGroup>> {
    return this.apiService.get(`${this.teamRoute}/current-space`, CaGroup,
      {resultIsPaginated: true, page: page, pageSize: pageSize});
  }

  public createTeam(label: string): Observable<CaGroup> {
    return this.apiService.post(`${this.teamRoute}/${label}`, null, CaGroup);
  }

  public updateTeamLabel(groupId: string, label: string): Observable<CaGroup> {
    return this.apiService.put(`${this.teamRoute}/${groupId}/label/${label}`, null, CaGroup);
  }

  public addUserToTeam(groupId: string, userId: string): Observable<CaUser> {
    return this.apiService.post(`${this.teamRoute}/${groupId}/add-user/${userId}`, null, CaUser);
  }

  public removeUserFromTeam(groupId: string, userId: string): Observable<void> {
    return this.apiService.delete(`${this.teamRoute}/${groupId}/remove-user/${userId}`, null);
  }

  public deleteTeamById(groupId: string): Observable<void> {
    return this.apiService.delete(`${this.teamRoute}/${groupId}`);
  }

  public getUsersOfTeam(groupId: string, page: number, size: number): Observable<ClPage<CaUser>> {
    return this.apiService.get(`${this.teamRoute}/${groupId}/users`, CaUser,
      {page: page, pageSize: size, resultIsPaginated: true});
  }

  public getUsersOfTeamDatasource(groupId: string): CaUserDatasourcePaginated {
    return new FlEntityPaginatedDatasource(
      (page, size) => this.getUsersOfTeam(groupId, page, size), 20);
  }
}
