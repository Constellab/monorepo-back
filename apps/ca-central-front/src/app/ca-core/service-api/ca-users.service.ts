import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {CaUser} from '../model/entities/ca-user.class';
import {FlApiService} from '@monorepo/front-core-lib';

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

  public findAll(): Observable<CaUser[]> {
    return this.apiService.get(this.route, CaUser);
  }

}
