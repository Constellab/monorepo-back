import {Injectable} from '@angular/core';
import {AuthenticationInterceptor} from './authentication.interceptor';
import {FlLocalStorageService} from '@monorepo/front-core-lib';

@Injectable({
  providedIn: 'root'
})
export class AuthenticatedUserService {

  private readonly jwtKey: string = 'token';

  constructor(private authenticationInterceptor: AuthenticationInterceptor,
              private localStorage: FlLocalStorageService) {
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


}
