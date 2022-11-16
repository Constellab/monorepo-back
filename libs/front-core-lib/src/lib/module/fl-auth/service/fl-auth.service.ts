import {Observable} from 'rxjs';
import {CmCredentials, CmCredentials2Fa} from '@monorepo/common-model';

export interface FlAuthLoginResponse {
  status: 'LOGGED_IN' | '2FA_REQUIRED';
  expiresIn?: number;
  twoFAUrlCode?: string;
}

export interface FlAuthLogin2FaResponse {
  status: 'LOGGED_IN';
  expiresIn: number;
}

/**
 * Service to enable login and logout method
 */
export abstract class FlAuthService {

  /**
   * Log in to API
   * The JWT is returned in a HTTPOnly cookie and is not accessible from JS
   * @param credentials username and password
   */
  public abstract login(credentials: CmCredentials): Observable<FlAuthLoginResponse>;

  /**
   * Methode to validate the 2FA code after the login if 2FA is required
   * @param credentials
   */
  public abstract checkTwoFA(credentials: CmCredentials2Fa): Observable<FlAuthLogin2FaResponse>;


  public abstract afterLogin(expiresIn: number): void;


  /**
   * Call the API to disconnect the user and remove his
   * JWT from the cookies
   */
  public abstract logout(): Observable<any>;
}
