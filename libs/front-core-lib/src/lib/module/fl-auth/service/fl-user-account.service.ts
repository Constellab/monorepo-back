import {Observable} from 'rxjs';
import {FlSignUpUser} from '../model/fl-sign-up-user.class';

/**
 * Service to manage user account, signup and password forgotten
 */
export abstract class FlUserAccountService {


  /**
   * Signup a new user
   */
  public abstract signup(user: FlSignUpUser): Observable<any>;

  /**
   * Route to send an email with password reset link
   */
  public abstract passwordForgotten(email: string): Observable<void>;

  /**
   * Route with a token to reset the user password
   */
  public abstract resetPassword(password: string, token: string): Observable<void> ;
}
