import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {CaUser} from '../model/entities/ca-user.class';
import {FlApiService} from '@monorepo/front-core-lib';
import {ClPageI} from '@monorepo/core-lib';

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


}
