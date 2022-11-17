import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {tap} from 'rxjs/operators';
import {
  FlApiService,
  FlAuthLogin2FaResponse,
  FlAuthLoginResponse,
  FlAuthService,
  FlCleanerService,
  FlCookieService
} from '@monorepo/front-core-lib';
import {CmCredentials, CmCredentials2Fa} from '@monorepo/common-model';
import {environment} from '../../../environments/ca-environment';

/**
 * Service to handle login and logout and store cookie to check if user is connected
 */
@Injectable({
  providedIn: 'root'
})
export class CaAuthService extends FlAuthService {

  private readonly route: string = 'auth';

  constructor(private apiService: FlApiService, cookieService: FlCookieService) {
    super(cookieService);
  }

  /**
   * Log in to API
   * The JWT is returned in a HTTPOnly cookie and is not accessible from JS
   * @param credentials username and password
   */
  public login(credentials: CmCredentials): Observable<FlAuthLoginResponse> {
    return this.apiService.post(this.route + '/login', credentials);
  }

  public checkTwoFA(credentials: CmCredentials2Fa): Observable<FlAuthLogin2FaResponse> {
    return this.apiService.post(this.route + '/login-2fa', credentials);
  }

  /**
   * Call the API to disconnect the user and remove his
   * JWT from the cookies
   */
  public logout(): Observable<void> {
    return this.apiService.post(this.route + '/logout', null).pipe(
      tap(() => this.clearAuthExpirationCookie(environment.frontDomain)),
      tap(() => this.clearServices())
    );
  }

  public afterLogin(expiresIn: number): void {
    this.storeAuthExpirationCookie(expiresIn, environment.frontDomain);
  }


  /**
   * Clear the store data in the services
   * @private
   */
  private clearServices(): void {
    FlCleanerService.getInstance().cleanServices();
  }
}
