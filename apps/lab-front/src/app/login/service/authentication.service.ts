import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {FlApiService, FlAuthService, FlLocalStorageService} from '@monorepo/front-core-lib';
import {CmCredentials} from '@monorepo/common-model';
import {AuthenticationInterceptor} from '../../core/service/authentication.interceptor';
import {tap} from 'rxjs/operators';

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

  private readonly jwtKey: string = 'token';

  constructor(private apiService: FlApiService,
              private authenticationInterceptor: AuthenticationInterceptor,
              private localStorage: FlLocalStorageService) {
    super();
  }

  /**
   * Log in to API
   * The JWT is returned in a HTTPOnly cookie and is not accessible from JS
   * @param credentials username and password
   */
  public login(credentials: CmCredentials): Observable<LoginResponse> {
    return this.apiService.post('login', credentials).pipe(
      tap((response: LoginResponse) => this.storeUserJWT(`Bearer ${response.access_token}`))
    );
  }


  /**
   * Call the API to disconnect the user and remove his
   * JWT from the cookies
   */
  public logout(): Observable<void> {
    console.error('Todo');
    return null;
  }

  /**
   * If the token exists in the local storage set it in the interceptor
   */
  public loadTokenFromLocalStorage(): void {
    const token: string = this.localStorage.getItem(this.jwtKey);

    if (token != null) {
      this.authenticationInterceptor.setToken(token);
    }
  }


  /**
   * Add the jwt to the local storage and set it in the authentication interceptor
   * @param jwt
   */
  public storeUserJWT(jwt: string): void {
    this.localStorage.setItem(this.jwtKey, jwt);
    this.authenticationInterceptor.setToken(jwt);
  }

  /**
   * Return true the token is stored in the local storage
   */
  public hasToken(): boolean {
    return this.localStorage.getItem(this.jwtKey) != null;
  }
}
