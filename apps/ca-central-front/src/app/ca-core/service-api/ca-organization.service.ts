import {Injectable} from '@angular/core';
import {FlApiCrudService, FlApiService, FlEntityPaginatedDatasource} from '@monorepo/front-core-lib';
import {
  CaOrganization,
  CaOrganizationDatasource,
  CaOrganizationInfoDto,
  CaOrganizationRole,
  CaOrganizationUser,
  CaOrganizationUserDatasource,
  CaSaveOrganizationDTO
} from '../model/entities/ca-organization.class';
import {Observable} from 'rxjs';
import {ClPage, ClPageI} from '@monorepo/core-lib';
import {CaOrganizationInvit, CaOrganizationInvitDatasource} from '../model/entities/ca-organization-invit.class';

@Injectable({
  providedIn: 'root'
})
export class CaOrganizationService extends FlApiCrudService<CaOrganization, CaSaveOrganizationDTO> {


  constructor(apiService: FlApiService) {
    super('organizations', CaOrganization, apiService);
  }

  public getCurrentInfo(): Observable<CaOrganizationInfoDto> {
    return this.apiService.get(`${this.route}/current-info`, CaOrganizationInfoDto);
  }

  public getMyOrganizations(): Observable<CaOrganization[]> {
    return this.apiService.get(`${this.route}/my-organizations`, CaOrganization);
  }

  public getAll(page: number, size: number): Observable<ClPage<CaOrganization>> {
    return this.apiService.get(`${this.route}`, CaOrganization,
      {page: page, pageSize: size, resultIsPaginated: true});
  }

  public getAllDatasource(): CaOrganizationDatasource {
    return new FlEntityPaginatedDatasource(
      (page, size) => this.getAll(page, size), 20);
  }

  public getUsersOfOrganization(organizationId: string, page: number, size: number): Observable<ClPage<CaOrganizationUser>> {
    return this.apiService.get(`${this.route}/${organizationId}/user`, CaOrganizationUser,
      {page: page, pageSize: size, resultIsPaginated: true});
  }

  public getUsersOfOrganizationDatasource(organizationId: string): CaOrganizationUserDatasource {
    return new CaOrganizationUserDatasource(
      (page, size) => this.getUsersOfOrganization(organizationId, page, size), 20);
  }

  public addUserToOrganization(organizationId: string, userId: string): Observable<CaOrganizationUser> {
    return this.apiService.put(`${this.route}/${organizationId}/user/${userId}`, null, CaOrganizationUser);
  }

  public removeUserFromOrganization(organizationId: string, userId: string): Observable<void> {
    return this.apiService.delete(`${this.route}/${organizationId}/user/${userId}`);
  }

  public activateUser(organizationId: string, userId: string): Observable<void> {
    return this.apiService.put(`${this.route}/${organizationId}/user/${userId}/activate`, null);
  }

  public deactivateUser(organizationId: string, userId: string): Observable<void> {
    return this.apiService.put(`${this.route}/${organizationId}/user/${userId}/deactivate`, null);
  }

  public updateUserRole(organizationId: string, userId: string, role: CaOrganizationRole): Observable<void> {
    return this.apiService.put(`${this.route}/${organizationId}/user/${userId}/role/${role}`, null);
  }

  public uploadOrganizationPhoto(organizationId: string, photo: File): Observable<CaOrganization> {
    const formData = new FormData();
    formData.append('photo', photo);
    return this.apiService.put(`${this.route}/${organizationId}/photo`, formData, CaOrganization);
  }

  public getOrganizationPhoto(filename: string): string {
    return this.apiService.getBaseRouteUrl(`${this.route}/photo/${filename}`);
  }

  public getInvitationsDatasource(organizationId: string): CaOrganizationInvitDatasource {
    return new FlEntityPaginatedDatasource(
      (page, size) =>
        this.getInvitations(organizationId, page, size), 20);
  }

  public getInvitations(organizationId: string, page: number, pageSize: number): Observable<ClPageI<CaOrganizationInvit>> {
    return this.apiService.get(`${this.route}/${organizationId}/invitations`, CaOrganizationInvit,
      {resultIsPaginated: true, page: page, pageSize: pageSize});
  }

  public getCurrentOrganization(): Observable<CaOrganization> {
    return this.apiService.get(`${this.route}/current`, CaOrganization);
  }

  public getDefaultOrganization(): Observable<CaOrganization> {
    return this.apiService.get(`${this.route}/default`, CaOrganization);
  }
}

