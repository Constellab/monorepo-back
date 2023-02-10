import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {LabEnvironmentHelper} from '../utils/lab-environment.helper';
import {catchError, map, mergeMap, tap} from 'rxjs/operators';
import {LabEnvStore} from './lab-env.store';
import {LabAuthenticatedUserService} from './lab-authenticated-user.service';

/**
 * Service to manage the DEV environment
 */
@Injectable({providedIn: 'root'})
export class LabDevEnvironmentService {

  constructor(private httpClient: HttpClient,
              private labEnvManager: LabEnvStore,
              private authenticatedUserService: LabAuthenticatedUserService){
  }

  /**
   * This method is trigger on startup,
   * it activates the dev environment only if
   *  - the user is in dev environment (from local storage)
   *  - the user's dev token is valid
   */
  public init(): Observable<void> {
    // if the user is in dev mode
    if (this.labEnvManager.getLabEnvironmentStorageValue() === 'dev') {
      // we check if the dev api is running
      return this.userIsLoggedInDev().pipe(
        map(isLogged => {
          if (isLogged) {
            this.labEnvManager.setLabEnvironment('dev');
          } else {
            this.labEnvManager.clearLabEnvironmentStorage();
          }
          return;
        })
      );
    }

    return of(null);
  }

  // return true if the dev API is running
  public devApiIsRunning(): Observable<boolean> {
    return this.httpClient.get(LabEnvironmentHelper.getDevCoreApiUrl() + 'health-check').pipe(
      map(() => true),
      catchError(() => of(false)),
    );
  }

  // return true if user is logged to the dev api
  public userIsLoggedInDev(): Observable<boolean> {
    return this.httpClient.get(LabEnvironmentHelper.getDevCoreApiUrl() + 'check-token').pipe(
      map(() => true),
      catchError(() => of(false)
      ),
    );
  }

  /**
   * Activate the development environment
   *
   * If the user has a
   */
  public activateDevEnvironment(): Observable<boolean> {
    return this.userIsLoggedInDev().pipe(
      mergeMap(result => {
        // if the user is logged in, activate the account
        if (result) {
          this.labEnvManager.setLabEnvironment('dev');
          return of(true);
        }

        return this.logUserInDevEnv();
      })
    );
  }

  /**
   * Log the user to the dev environment using the production token
   * If success, its returns the token for dev env
   */
  private logUserInDevEnv(): Observable<boolean> {
    return this.authenticatedUserService.generateTemp().pipe(
      mergeMap(code => this.devLogin(code)),
    );

    // return this.httpClient.post(LabEnvironmentHelper.getDevCoreApiUrl() + 'dev-login', null).pipe(
    //   tap(() => this.devLoginSuccess()),
    //   map(() => true),
    //   catchError(() => of(false)),
    // );
  }

  private devLogin(code: string): Observable<boolean> {
    return this.httpClient.post(LabEnvironmentHelper.getDevCoreApiUrl() + `dev-login/${code}`, null).pipe(
      tap(() => this.devLoginSuccess()),
      map(() => true),
      catchError(() => of(false)),
    );
  }

  // store the dev token and switch env to dev
  private devLoginSuccess(): void {
    this.labEnvManager.setLabEnvironment('dev');
  }


}
