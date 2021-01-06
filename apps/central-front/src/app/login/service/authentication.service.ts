import {Injectable} from '@angular/core';
import {ApiService} from '../../core/service-api/api.service';
import {Credentials} from '../../core/model/global/credentials.class';
import {Observable} from 'rxjs';
import {tap} from 'rxjs/operators';
import {CoreCookieService} from '../../core/service/core-cookie.service';
import {authExpiredCookie} from '../../core/model/global/cookie.class';
import {CleanerService} from '../../core/utils/cleanable-service';

/**
 * Service to handle login and logout and store cookie to check if user is connected
 */
@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  private readonly route: string = 'auth';

  constructor(private apiService: ApiService, private cookieService: CoreCookieService) {
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
    this.cookieService.setCookie(authExpiredCookie, date.getTime(),
      {expires: date, sameSite: 'Strict', path: '/', secure: false});
  }

  private clearAuthExpirationCookie(): void {
    this.cookieService.removeCookie(authExpiredCookie,
      {sameSite: 'Strict', path: '/', secure: false});
  }

  /**
   * Clear the store data in the services
   * @private
   */
  private clearServices(): void {
    CleanerService.getInstance().cleanServices();
  }

  /**
   * Return true if the cookie 'Auth_Expiration' exists
   */
  public hasAuthorizationCookie(): boolean {
    return this.cookieService.check(authExpiredCookie);
  }

  /**
   * Return the token expiration date from 'Auth_Expiration' cookie
   * or null if no token is present
   */
  public getTokenExpiration(): Date {
    const stringDate = this.cookieService.getStringCookie(authExpiredCookie);
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
