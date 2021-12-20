import {Injectable} from '@angular/core';
import {CaNewUser, CaUser} from '../model/entities/ca-user.class';
import {Observable} from 'rxjs';
import {FlApiService, FlArrayObs, FlEntityArrayObs, FlUserAccountService} from '@monorepo/front-core-lib';

/**
 * Service to manage users' accounts
 */
@Injectable({
  providedIn: 'root'
})
export class CaUserAccountsService extends FlUserAccountService{

  private readonly route: string = 'accounts';

  constructor(private apiService: FlApiService) {
    super();
  }

  /**
   * Signup a new user
   */
  public signup(user: CaNewUser): Observable<CaUser> {
    delete user.repeatPassword;
    return this.apiService.post(this.route, user, CaUser);
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
  public adminActivateUser(userId: string): Observable<CaUser> {
    return this.apiService.post(`${this.route}/adminActivation/${userId}`, CaUser);
  }

  public findUsersToAdminActivate(): FlArrayObs<CaUser> {
    return new FlEntityArrayObs(this.apiService.get(`${this.route}/usersToAdminActivate`, CaUser));
  }
}
