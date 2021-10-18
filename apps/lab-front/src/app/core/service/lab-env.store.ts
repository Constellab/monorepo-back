import {Injectable} from '@angular/core';
import {FlCleanableService, FlCleanerService, FlLocalStorageService} from '@monorepo/front-core-lib';
import {LabEnvironment} from '../model/global/lab-environment.class';
import {BehaviorSubject, Observable} from 'rxjs';
import {EnvironmentHelper} from '../utils/environment.helper';

/**
 * Class to manage the env and jwt, store it and clean it
 */
@Injectable({providedIn: 'root'})
export class LabEnvStore implements FlCleanableService {


  private readonly jwtStorageKey: string = 'token';
  private readonly devJwtStorageKey: string = 'dev-token';
  private readonly labEnvironmentStorageKey: string = 'lab-environment';

  private _labEnvironment$: BehaviorSubject<LabEnvironment> = new BehaviorSubject('prod');
  private token: string;
  private devToken: string;

  constructor(private localStorage: FlLocalStorageService) {
    FlCleanerService.getInstance().registerService(this);
  }

  /**
   * Add the jwt to the local storage based on current environment
   * @param jwt
   */
  public storeUserJWT(jwt: string): void {
    const env: LabEnvironment = this.getLabEnvironment();
    this.localStorage.setItem(this.getStorageKey(env), jwt);
    if (env === 'prod') {
      this.token = jwt;
    } else {
      this.devToken = jwt;
    }
  }


  /**
   * Clear the jwt form the memory and local storage
   * and clear all the services data
   * @param mode if all clear the prod and dev token, otherwise it clears only the dev token
   */
  public clearUserJWTAndData(mode: 'all' | 'onlyDev'): void {
    // only clear the prod jwt if we are in prod
    if (mode === 'all') {
      this.localStorage.removeItem(this.jwtStorageKey);
      this.token = null;
    }
    this.localStorage.removeItem(this.devJwtStorageKey);
    this.devToken = null;
  }


  /**
   * Return true the token is stored in the local storage
   */
  public hasToken(env: LabEnvironment = 'prod'): boolean {
    return this.localStorage.getItem(this.getStorageKey(env)) != null;
  }

  /**
   * If the token exists in the local storage set it in the interceptor
   */
  public loadTokenFromLocalStorage(): void {
    const token: string = this.getTokenFromLocalStorage('prod');
    if (token != null) {
      this.token = token;
    }

    const devToken: string = this.getTokenFromLocalStorage('dev');
    if (devToken != null) {
      this.devToken = devToken;
    }
  }

  // return the correct storage key based on environment
  private getStorageKey(env?: LabEnvironment): string {
    if (!env) {
      env = this.getLabEnvironment();
    }
    return env === 'prod' ? this.jwtStorageKey : this.devJwtStorageKey;
  }

  private getTokenFromLocalStorage(env: LabEnvironment = 'prod'): string {
    return this.localStorage.getItem(this.getStorageKey(env));
  }

  /**
   * Get the user's token
   * @param env if not provided, it uses the current env
   */
  public getToken(env?: LabEnvironment): string {
    if (!env) {
      env = this.getLabEnvironment();
    }
    // return the corresponding token.
    // in front dev env, return always the prod token
    return (env === 'prod' || !EnvironmentHelper.isProd()) ? this.token : this.devToken;
  }

  public setLabEnvironment(environment: LabEnvironment): void {
    if (this.getLabEnvironment() === environment) return;

    this.localStorage.setItem(this.labEnvironmentStorageKey, environment);
    this._labEnvironment$.next(environment);
  }

  public getLabEnvironment$(): Observable<LabEnvironment> {
    return this._labEnvironment$.asObservable();
  }

  public getLabEnvironment(): LabEnvironment {
    return this._labEnvironment$.value;
  }

  public isDev(): boolean {
    return this.getLabEnvironment() === 'dev';
  }

  public isProd(): boolean {
    return this.getLabEnvironment() === 'prod';
  }

  /**
   * Return the environment store in the local storage with prod by default
   * @private
   */
  public getLabEnvironmentStorageValue(): LabEnvironment {
    const value: string = this.localStorage.getItem(this.labEnvironmentStorageKey);

    if (value == null) {
      return 'prod';
    }

    if (value !== 'prod' && value !== 'dev') {
      this.localStorage.removeItem(this.labEnvironmentStorageKey);
      return 'prod';
    }

    return value;
  }

  public clearLabEnvironmentStorage(): void {
    this.localStorage.removeItem(this.labEnvironmentStorageKey);
  }


  clean(): void {
    this.clearUserJWTAndData('all');
    this.setLabEnvironment('prod');
    this.clearLabEnvironmentStorage();
  }

}
