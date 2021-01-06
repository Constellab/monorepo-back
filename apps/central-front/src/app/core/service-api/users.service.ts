import {Injectable} from '@angular/core';
import {ApiService} from './api.service';
import {Observable} from 'rxjs';
import {User} from '../model/entities/user.class';

/**
 * Service for the User entities
 */
@Injectable({
  providedIn: 'root'
})
export class UsersService {

  private readonly route: string = 'users';

  constructor(private apiService: ApiService) {
  }

  public findAll(): Observable<User[]> {
    return this.apiService.get(this.route, User);
  }

}
