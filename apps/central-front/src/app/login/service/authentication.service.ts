import {Injectable} from '@angular/core';
import {Credentials} from '../../core/model/global/credentials.class';
import {Observable} from 'rxjs';
import {tap} from 'rxjs/operators';
import {FlApiService, flAuthExpiredCookie, FlCleanerService, FlCookieService} from '@monorepo/front-core-lib';

/**
 * Service to handle login and logout and store cookie to check if user is connected
 */
@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  private readonly route: string = 'auth';

  constructor(private apiService: FlApiService, private cookieService: FlCookieService) {
  }

  /**
   * Log in to API
   * The JWT is returned in a HTTPOnly cookie and is not accessible from JS
   * @param credentials username and password
   */
  public login(credentials: Credentials): Observable<{ expiresIn: number }> {
    return this.apiService.post(this.route + '/login', credentials).pipe(
      tap(expiresIn => this.setAuthExpirationCookie(expiresIn))
    );
  }


  /**
   * Call the API to disconnect the user and remove his
   * JWT from the cookies
   */
  public logout(): Observable<void> {
    return this.apiService.post(this.route + '/logout', null).pipe(
      tap(() => this.clearAuthExpirationCookie()),
      tap(() => this.clearServices())
    );
  }

  private setAuthExpirationCookie(expiresIn: { expiresIn: number }): void {
    // get the date in expiresIn milliseconds
    const date = new Date(new Date().getTime() + expiresIn.expiresIn);
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
   * Clear the store data in the services
   * @private
   */
  private clearServices(): void {
    FlCleanerService.getInstance().cleanServices();
  }

  /**
   * Return true if the cookie 'Auth_Expiration' exists
   */
  public hasAuthorizationCookie(): boolean {
    return this.cookieService.check(flAuthExpiredCookie);
  }

  /**
   * Return the token expiration date from 'Auth_Expiration' cookie
   * or null if no token is present
   */
  public getTokenExpiration(): Date {
    const stringDate = this.cookieService.getStringCookie(flAuthExpiredCookie);
    if (!stringDate) {
      return null;
    } else {
      try {
        return new Date(parseInt(stringDate, 10));
      } catch (e) {
        return null;
      }
    }
  }
}
