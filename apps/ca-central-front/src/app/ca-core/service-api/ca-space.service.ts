import {Injectable} from '@angular/core';
import {FlApiCrudService, FlApiService, FlEntityPaginatedDatasource} from '@monorepo/front-core-lib';
import {
  CaSaveSpaceDTO,
  CaSpace,
  CaSpaceDatasource,
  CaSpaceInfoDto,
  CaSpaceRole,
  CaSpaceUser,
  CaSpaceUserDatasource
} from '../model/entities/ca-space.class';
import {Observable} from 'rxjs';
import {ClPage, ClPageI} from '@monorepo/core-lib';
import {CaSpaceInvit, CaSpaceInvitDatasource} from '../model/entities/ca-space-invit.class';
import {CaRequestNewLicensesDto} from '../model/dto/ca-space.dto';
import {CaUser, CaUserDatasourcePaginated} from '../model/entities/ca-user.class';

@Injectable({
  providedIn: 'root'
})
export class CaSpaceService extends FlApiCrudService<CaSpace, CaSaveSpaceDTO> {


  constructor(apiService: FlApiService) {
    super('spaces', CaSpace, apiService);
  }

  public getCurrentInfo(): Observable<CaSpaceInfoDto> {
    return this.apiService.get(`${this.route}/current-info`, CaSpaceInfoDto);
  }

  public getMySpaces(): Observable<CaSpace[]> {
    return this.apiService.get(`${this.route}/my-spaces`, CaSpace);
  }

  public getAll(page: number, size: number): Observable<ClPage<CaSpace>> {
    return this.apiService.get(`${this.route}`, CaSpace,
      {page: page, pageSize: size, resultIsPaginated: true});
  }

  public getAllDatasource(): CaSpaceDatasource {
    return new FlEntityPaginatedDatasource(
      (page, size) => this.getAll(page, size), 20);
  }

  public getUsersOfSpace(spaceId: string, page: number, size: number): Observable<ClPage<CaSpaceUser>> {
    return this.apiService.get(`${this.route}/${spaceId}/user`, CaSpaceUser,
      {page: page, pageSize: size, resultIsPaginated: true});
  }

  public getUsersOfSpaceDatasource(spaceId: string): CaSpaceUserDatasource {
    return new CaSpaceUserDatasource(
      (page, size) => this.getUsersOfSpace(spaceId, page, size), 20);
  }

  public addUserToSpace(spaceId: string, userId: string): Observable<CaSpaceUser> {
    return this.apiService.post(`${this.route}/${spaceId}/user/${userId}`, null, CaSpaceUser);
  }

  public removeUserFromSpace(spaceId: string, userId: string): Observable<void> {
    return this.apiService.delete(`${this.route}/${spaceId}/user/${userId}`);
  }

  public activateUser(spaceId: string, userId: string): Observable<void> {
    return this.apiService.put(`${this.route}/${spaceId}/user/${userId}/activate`, null);
  }

  public deactivateUser(spaceId: string, userId: string): Observable<void> {
    return this.apiService.put(`${this.route}/${spaceId}/user/${userId}/deactivate`, null);
  }

  public updateUserRole(spaceId: string, userId: string, role: CaSpaceRole): Observable<void> {
    return this.apiService.put(`${this.route}/${spaceId}/user/${userId}/role/${role}`, null);
  }

  public uploadSpacePhoto(spaceId: string, photo: File): Observable<CaSpace> {
    const formData = new FormData();
    formData.append('photo', photo);
    return this.apiService.put(`${this.route}/${spaceId}/photo`, formData, CaSpace);
  }

  public getSpacePhoto(filename: string): string {
    return this.apiService.getBaseRouteUrl(`${this.route}/photo/${filename}`);
  }

  public getInvitationsDatasource(spaceId: string): CaSpaceInvitDatasource {
    return new FlEntityPaginatedDatasource(
      (page, size) =>
        this.getInvitations(spaceId, page, size), 20);
  }

  public getInvitations(spaceId: string, page: number, pageSize: number): Observable<ClPageI<CaSpaceInvit>> {
    return this.apiService.get(`${this.route}/${spaceId}/invitations`, CaSpaceInvit,
      {resultIsPaginated: true, page: page, pageSize: pageSize});
  }

  public getCurrentSpace(): Observable<CaSpace> {
    return this.apiService.get(`${this.route}/current`, CaSpace);
  }

  public getDefaultSpace(): Observable<CaSpace> {
    return this.apiService.get(`${this.route}/default`, CaSpace);
  }

  public getSpaceUser(spaceId: string, userId: string): Observable<CaUser> {
    return this.apiService.get(`${this.route}/${spaceId}/user/${userId}`, CaUser);
  }

  /**
   * Return the list of user for an space (not SpaceUser)
   */
  public getSpaceSimpleUsers(spaceId: string, page: number, size: number): Observable<ClPage<CaUser>> {
    return this.apiService.get(`${this.route}/${spaceId}/user-simple`, CaUser,
      {page: page, pageSize: size, resultIsPaginated: true});
  }

  public getSpaceSimpleUsersDatasource(spaceId: string): CaUserDatasourcePaginated {
    return new FlEntityPaginatedDatasource(
      (page, size) => this.getSpaceSimpleUsers(spaceId, page, size), 20);
  }

  ////////////////////////////////// OTHERS //////////////////////////////////
  public requestNewLicenses(spaceId: string, request: CaRequestNewLicensesDto): Observable<void> {
    return this.apiService.post(`${this.route}/${spaceId}/request-new-licenses`, request);
  }

  public generateAllUserPersonalSpace(): Observable<void> {
    return this.apiService.post(`${this.route}/generate-all-user-personal-space`, null);
  }

}

