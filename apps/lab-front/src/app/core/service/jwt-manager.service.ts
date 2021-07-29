import {Injectable} from '@angular/core';
import {FlCleanerService, FlLocalStorageService} from '@monorepo/front-core-lib';
import {AuthenticationInterceptor} from './authentication.interceptor';

/**
 * Class to manage the jwt, store it and clean it
 */
@Injectable({providedIn: 'root'})
export class JwtManagerService {

  private readonly jwtStorageKey: string = 'token';


  constructor(private authenticationInterceptor: AuthenticationInterceptor,
              private localStorage: FlLocalStorageService) {
  }

  /**
   * Add the jwt to the local storage and set it in the authentication interceptor
   * @param jwt
   */
  public storeUserJWT(jwt: string): void {
    this.localStorage.setItem(this.jwtStorageKey, jwt);
    this.authenticationInterceptor.setToken(jwt);
  }

  /**
   * Clear the jwt form the memory and local storage
   * and clear all the services data
   */
  public clearUserJWTAndData(): void {
    this.clearUserJWT();
    // clear all the services
    FlCleanerService.getInstance().cleanServices();
  }

  /**
   * Clear the jwt form the memory and local storage
   */
  private clearUserJWT(): void {
    this.localStorage.removeItem(this.jwtStorageKey);
    this.authenticationInterceptor.clean();
  }

  /**
   * Return true the token is stored in the local storage
   */
  public hasToken(): boolean {
    return this.localStorage.getItem(this.jwtStorageKey) != null;
  }

  /**
   * If the token exists in the local storage set it in the interceptor
   */
  public loadTokenFromLocalStorage(): void {
    const token: string = this.localStorage.getItem(this.jwtStorageKey);

    if (token != null) {
      this.authenticationInterceptor.setToken(token);
    }
  }
}
