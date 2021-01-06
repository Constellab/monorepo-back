import {Injectable} from '@angular/core';
import {ApiService} from './api.service';
import {NewUser, User} from '../model/entities/user.class';
import {Observable} from 'rxjs';
import {ArrayObs} from '../model/datasource/array-obs.class';
import {EntityArrayObs} from '../model/datasource/entity-array.class';

/**
 * Service to manage users' accounts
 */
@Injectable({
  providedIn: 'root'
})
export class UserAccountsService {

  private readonly route: string = 'accounts';

  constructor(private apiService: ApiService) {
  }

  /**
   * Signup a new user
   */
  public signup(user: NewUser): Observable<User> {
    delete user.repeatPassword;
    return this.apiService.post(this.route, user, User);
  }

  /**
   * Route to send an email with password reset link
   */
  public passwordForgotten(email: string): Observable<void> {
    return this.apiService.post(`${this.route}/password-forgotten`, {email: email});
  }

  /**
   * Route with a token to reset the user password
   */
  public resetPassword(password: string, token: string): Observable<void> {
    return this.apiService.post(`${this.route}/reset-password/${token}`, {password: password});
  }

  /**
   * Route with a token to reset the user password
   */
  public adminActivateUser(userId: string): Observable<User> {
    return this.apiService.post(`${this.route}/adminActivation/${userId}`, User);
  }

  public findUsersToAdminActivate(): ArrayObs<User> {
    return new EntityArrayObs(this.apiService.get(`${this.route}/usersToAdminActivate`, User));
  }
}
