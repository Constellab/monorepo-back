import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {CaUser, CaUserDatasourcePaginated} from '../model/entities/ca-user.class';
import {
  FlAdvancedSearchInput,
  FlApiService,
  FlEntityPaginatedDatasource,
  FlSearchConverter
} from '@monorepo/front-core-lib';
import {ClPage, ClPageI} from '@monorepo/core-lib';
import {CaUserSearch, CaUserSearchFields} from '../entity-module/ca-user-core/model/ca-user-search.class';

/**
 * Service for the User entities
 */
@Injectable({
  providedIn: 'root'
})
export class CaUsersService {

  private readonly route: string = 'users';

  constructor(private apiService: FlApiService) {
  }

  public getUserPhoto(photo: string): string {
    return this.apiService.getBaseRouteUrl(`${this.route}/photo-v2/${photo}`);
  }

  public findAll(page: number, pageSize: number): Observable<ClPageI<CaUser>> {
    return this.apiService.get(`${this.route}`, CaUser,
      {page: page, pageSize: pageSize, resultIsPaginated: true});
  }

  public search(page: number, pageSize: number, filters?: CaUserSearchFields): Observable<ClPage<CaUser>> {
    const data: FlAdvancedSearchInput = {
      filtersCriteria: FlSearchConverter.convertObjectToSearchCriteriaList(filters, CaUserSearch.advancedSearchConverter),
      sortsCriteria: null
    };
    return this.apiService.post(`${this.route}/search`, data, CaUser, {
      page: page, pageSize: pageSize, resultIsPaginated: true
    });
  }

  public searchByNames(name: string, page: number, pageSize: number): Observable<ClPage<CaUser>> {
    return this.apiService.get(`${this.route}/search/name/${name}`, CaUser, {
      page: page, pageSize: pageSize, resultIsPaginated: true
    });
  }

  public searchByNamesDatasource(): CaUserDatasourcePaginated {
    return new FlEntityPaginatedDatasource(
      (page, size, name) => this.searchByNames(name, page, size), 20, false);

  }

}
