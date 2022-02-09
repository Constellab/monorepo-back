import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {
  FlApiService,
  flAuthExpiredCookie,
  FlAuthService,
  FlCleanerService,
  FlCookieService
} from '@monorepo/front-core-lib';
import {CmCredentials} from '@monorepo/common-model';
import {tap} from 'rxjs/operators';

interface ExpiresIn {
  expiresIn: number;
}

/**
 * Service to handle login and logout and store cookie to check if user is connected
 */
@Injectable({
  providedIn: 'root'
})
export class LabAuthenticationService extends FlAuthService {


  constructor(private apiService: FlApiService,
              private cookieService: FlCookieService) {
    super();
  }

  /**
   * Log in to API
   * The JWT is returned in a HTTPOnly cookie and is not accessible from JS
   * @param credentials username and password
   */
  public login(credentials: CmCredentials): Observable<ExpiresIn> {
    return this.apiService.post('login', credentials).pipe(
      tap((expiresIn: ExpiresIn) => this.setAuthExpirationCookie(expiresIn.expiresIn))
    );
  }

  public autoLogin(tempToken: string): Observable<ExpiresIn> {
    return this.apiService.post(`login-temp-access/${tempToken}`, null).pipe(
      tap((expiresIn: ExpiresIn) => this.setAuthExpirationCookie(expiresIn.expiresIn))
    );
  }

  public setAuthExpirationCookie(expiresIn: number): void {
    // get the date in expiresIn milliseconds
    const date = new Date(new Date().getTime() + (expiresIn * 1000));
    // clear the millisecond to get closer to real expiration
    date.setMilliseconds(0);
    this.cookieService.setCookie(flAuthExpiredCookie, date.getTime(),
      {expires: date, sameSite: 'Strict', path: '/', secure: false});
  }

  private clearAuthExpirationCookie(): void {
    this.cookieService.removeCookie(flAuthExpiredCookie,
      {sameSite: 'Strict', path: '/', secure: false});
  }

  /**
   * Remove the JWT from the memory and localstorage, clear the user data
   */
  public logout(): Observable<void> {
    return this.apiService.post('logout', null).pipe(
      tap(() => this.clearAuthExpirationCookie()),
      tap(() => this.clearServices())
    );
  }

  /**
   * Return true if the cookie 'Auth_Expiration' exists
   */
  public hasAuthorizationCookie(): boolean {
    return this.cookieService.check(flAuthExpiredCookie);
  }

  /**
   * Clear the store data in the services
   * @private
   */
  private clearServices(): void {
    FlCleanerService.getInstance().cleanServices();
  }
}
