import {Injectable} from '@angular/core';
import {FlApiCrudService, FlApiService, FlEntityPaginatedDatasource} from '@monorepo/front-core-lib';
import {
  CaOrganization,
  CaOrganizationDatasource,
  CaOrganizationRole,
  CaOrganizationUser,
  CaOrganizationUserDatasource,
  CaSaveOrganizationDTO
} from '../model/entities/ca-organization.class';
import {Observable} from 'rxjs';
import {ClPage} from '@monorepo/core-lib';

@Injectable({
  providedIn: 'root'
})
export class CaOrganizationService extends FlApiCrudService<CaOrganization, CaSaveOrganizationDTO> {


  constructor(apiService: FlApiService) {
    super('organizations', CaOrganization, apiService);
  }

  //////////////////////////////// CURRENT ORGA ROUTES ////////////////////////////////

  //////////////////////////////// G ADMIN ROUTES ////////////////////////////////



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
}
