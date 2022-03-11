import {Injectable} from '@angular/core';
import {FlApiCrudService, FlApiService, FlEntityPaginatedDatasource} from '@monorepo/front-core-lib';
import {
  CaOrganization,
  CaOrganizationDatasourcePaginated,
  CaSaveOrganizationDTO
} from '../model/entities/ca-organization.class';
import {Observable} from 'rxjs';
import {ClPage} from '@monorepo/core-lib';
import {CaUser, CaUserDatasourcePaginated} from '../model/entities/ca-user.class';

@Injectable({
  providedIn: 'root'
})
export class CaOrganizationService extends FlApiCrudService<CaOrganization, CaSaveOrganizationDTO> {


  constructor(apiService: FlApiService) {
    super('organizations', CaOrganization, apiService);
  }

  public getAll(page: number, size: number): Observable<ClPage<CaOrganization>> {
    return this.apiService.get(`${this.route}`, CaOrganization,
      {page: page, pageSize: size, resultIsPaginated: true});
  }

  public getAllDatasource(): CaOrganizationDatasourcePaginated {
    return new FlEntityPaginatedDatasource(
      (page, size) => this.getAll(page, size), 20);
  }

  public getUsersOfOrganization(organizationId: string, page: number, size: number): Observable<ClPage<CaUser>> {
    return this.apiService.get(`${this.route}/${organizationId}/users`, CaUser,
      {page: page, pageSize: size, resultIsPaginated: true});
  }

  public getUsersOfOrganizationDatasource(organizationId: string): CaUserDatasourcePaginated {
    return new FlEntityPaginatedDatasource(
      (page, size) => this.getUsersOfOrganization(organizationId, page, size), 20);
  }

  public addUserToOrganization(organizationId: string, userId: string): Observable<CaUser> {
    return this.apiService.put(`${this.route}/${organizationId}/add-user/${userId}`, null, CaUser);
  }

  public removeUserFromOrganization(organizationId: string, userId: string): Observable<void> {
    return this.apiService.delete(`${this.route}/${organizationId}/remove-user/${userId}`);
  }
}
