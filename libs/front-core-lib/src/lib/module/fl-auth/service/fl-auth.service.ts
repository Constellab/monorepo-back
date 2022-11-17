import {Observable} from 'rxjs';
import {CmCredentials, CmCredentials2Fa} from '@monorepo/common-model';
import {FlCookieService} from '../../../service/fl-cookie.service';
import {flAuthExpiredCookie} from '../../../service/model/fl-cookie.class';

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

  protected constructor(private cookieService: FlCookieService) {
  }

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

  protected storeAuthExpirationCookie(expiresIn: number, domain?: string): void {
    // get the date in expiresIn milliseconds
    const date = new Date(new Date().getTime() + expiresIn);
    // clear the millisecond to get closer to real expiration
    date.setMilliseconds(0);
    this.cookieService.setCookie(flAuthExpiredCookie, date.getTime(),
      {expires: date, sameSite: 'Strict', path: '/', secure: false, domain: domain});
  }

  protected clearAuthExpirationCookie(domain?: string): void {
    this.cookieService.removeCookie(flAuthExpiredCookie,
      {sameSite: 'Strict', path: '/', secure: false, domain: domain});
  }

  /**
   * Return true if the cookie 'Auth_Expiration' exists
   */
  public hasAuthorizationCookie(): boolean {
    return this.cookieService.check(flAuthExpiredCookie);
  }
}
