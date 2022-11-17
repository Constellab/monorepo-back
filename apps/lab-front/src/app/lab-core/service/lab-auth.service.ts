import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {
  FlApiService,
  FlAuthLogin2FaResponse,
  FlAuthLoginResponse,
  FlAuthService,
  FlCleanerService,
  FlCookieService
} from '@monorepo/front-core-lib';
import {CmCredentials, CmCredentials2Fa} from '@monorepo/common-model';
import {tap} from 'rxjs/operators';


/**
 * Service to handle login and logout and store cookie to check if user is connected
 */
@Injectable({
  providedIn: 'root'
})
export class LabAuthService extends FlAuthService {


  constructor(private apiService: FlApiService,
              cookieService: FlCookieService) {
    super(cookieService);
  }

  /**
   * Log in to API
   * The JWT is returned in a HTTPOnly cookie and is not accessible from JS
   * @param credentials username and password
   */
  public login(credentials: CmCredentials): Observable<FlAuthLoginResponse> {
    return this.apiService.post('login', credentials);
  }

  afterLogin(expiresIn: number): void {
    this.storeAuthExpirationCookie(expiresIn);
  }

  checkTwoFA(credentials: CmCredentials2Fa): Observable<FlAuthLogin2FaResponse> {
    return this.apiService.post('login-2fa', credentials);
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
   * Clear the store data in the services
   * @private
   */
  private clearServices(): void {
    FlCleanerService.getInstance().cleanServices();
  }
}
