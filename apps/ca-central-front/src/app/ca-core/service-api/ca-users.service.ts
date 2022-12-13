import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {CaUser} from '../model/entities/ca-user.class';
import {FlAdvancedSearchInput, FlApiService, FlSearchConverter} from '@monorepo/front-core-lib';
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

  public getUserPhoto(userId: string): string {
    return this.apiService.getBaseRouteUrl(`${this.route}/photo/${userId}`);
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


}
