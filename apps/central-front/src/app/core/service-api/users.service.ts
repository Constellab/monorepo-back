import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {User} from '../model/entities/user.class';
import {FlApiService} from '@monorepo/front-core-lib';

/**
 * Service for the User entities
 */
@Injectable({
  providedIn: 'root'
})
export class UsersService {

  private readonly route: string = 'users';

  constructor(private apiService: FlApiService) {
  }

  public findAll(): Observable<User[]> {
    return this.apiService.get(this.route, User);
  }

}
