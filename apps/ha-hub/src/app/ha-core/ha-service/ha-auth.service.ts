import {Injectable} from '@angular/core';
import {
  FlApiService,
  flAuthExpiredCookie,
  FlAuthService,
  FlCleanerService,
  FlCookieService
} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {tap} from 'rxjs/operators';
import {CmCredentials} from '@monorepo/common-model';

@Injectable({
  providedIn: 'root'
})
export class HaAuthService extends FlAuthService {
  private readonly route: string = 'auth';

  constructor(
    private apiService: FlApiService,
    private cookieService: FlCookieService
  ) {
    super();
  }

  public login(credentials: CmCredentials): Observable<{ expiresIn: number }> {
    return this.apiService.post(`${this.route}/login`, credentials).pipe(
      tap(expiresIn => this.setAuthExpirationCookie(expiresIn))
    );
  }

  public logout(): Observable<void> {
    return this.apiService.post(`${this.route}/logout`, null).pipe(
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

  private clearServices(): void {
    FlCleanerService.getInstance().cleanServices();
  }

  /**
   * Return true if the cookie 'Auth_Expiration' exists
   */
  public hasAuthorizationCookie(): boolean {
    return this.cookieService.check(flAuthExpiredCookie);
  }
}
