import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {FlApiService, FlAuthService} from '@monorepo/front-core-lib';
import {CmCredentials} from '@monorepo/common-model';
import {tap} from 'rxjs/operators';
import {JwtManagerService} from './jwt-manager.service';

interface LoginResponse {
  access_token: string,
  token_type: string
}

/**
 * Service to handle login and logout and store cookie to check if user is connected
 */
@Injectable({
  providedIn: 'root'
})
export class AuthenticationService extends FlAuthService {


  constructor(private apiService: FlApiService,
              private jwtManager: JwtManagerService) {
    super();
  }

  /**
   * Log in to API
   * The JWT is returned in a HTTPOnly cookie and is not accessible from JS
   * @param credentials username and password
   */
  public login(credentials: CmCredentials): Observable<LoginResponse> {
    return this.apiService.post('login', credentials).pipe(
      tap((response: LoginResponse) => this.jwtManager.storeUserJWT(`Bearer ${response.access_token}`))
    );
  }


  /**
   * Remove the JWT from the memory and localstorage, clear the user data
   */
  public logout(): Observable<void> {
    this.jwtManager.clearUserJWTAndData();
    return of(null);
  }
}
