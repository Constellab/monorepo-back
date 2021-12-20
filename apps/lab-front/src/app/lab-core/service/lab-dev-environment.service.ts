import {Injectable} from '@angular/core';
import {
  FlDialogService,
  FlLocalStorageService,
  FlLoginDialogComponent,
  FlLoginDialogInput,
  FlLoginDialogResult
} from '@monorepo/front-core-lib';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {LabEnvironmentHelper} from '../utils/lab-environment.helper';
import {catchError, map, mergeMap, tap} from 'rxjs/operators';
import {LabEnvStore} from './lab-env.store';
import {LabLoginResponse} from '../model/global/lab-login-response.class';

/**
 * Service to manage the DEV environment
 */
@Injectable({providedIn: 'root'})
export class LabDevEnvironmentService {

  constructor(private localStorageService: FlLocalStorageService,
              private httpClient: HttpClient,
              private labEnvManager: LabEnvStore,
              private dialogService: FlDialogService) {
  }

  /**
   * This method is trigger on startup,
   * it activates the dev environment only if
   *  - the user is in dev environment (from local storage)
   *  - the user's dev token is valid
   */
  public init(): Observable<void> {
    // if the user is int dev mode
    if (this.labEnvManager.getLabEnvironmentStorageValue() === 'dev') {
      // we check if the dev api is running
      return this.userIsLoggedInDev().pipe(
        map(isLogged => {
          if (isLogged) {
            this.labEnvManager.setLabEnvironment('dev');
          } else {
            this.labEnvManager.clearUserJWTAndData('onlyDev');
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
    const devToken: string = this.labEnvManager.getToken('dev');

    if (devToken == null) return of(false);

    const header: HttpHeaders = new HttpHeaders({
      Authorization: this.labEnvManager.getToken('prod'),
    });
    return this.httpClient.get(LabEnvironmentHelper.getDevCoreApiUrl() + 'check-token', {headers: header}).pipe(
      map(() => true),
      catchError(() => {
        this.labEnvManager.clearUserJWTAndData('onlyDev');
        return of(false);
      }),
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
   * It success, its returns the token for dev env
   */
  private logUserInDevEnv(): Observable<boolean> {
    const header: HttpHeaders = new HttpHeaders({
      Authorization: this.labEnvManager.getToken('prod'),
    });

    return this.httpClient.post(LabEnvironmentHelper.getDevCoreApiUrl() + 'dev-login', null, {headers: header}).pipe(
      tap((token: LabLoginResponse) => this.devLoginSuccess(token)),
      map(() => true),
      catchError(() => this.openDevLoginDialog()),
    );
  }

  /**
   * Open the login in a dialog and switch to DEV mode if login is successful,
   * otherwise switch to prod mode
   * @private
   */
  private openDevLoginDialog(): Observable<boolean> {
    // switch to dev mode so the login uses dev api
    this.labEnvManager.setLabEnvironment('dev');
    const input: FlLoginDialogInput = {disabledFooter: true};
    return this.dialogService.openSmallDialog(FlLoginDialogComponent, {data: input}).afterClosed().pipe(
      map((result: FlLoginDialogResult) => {
        // if the login was successful, save the token
        if (result?.success) {
          this.devLoginSuccess(result.response);
          return true;
          // if the login wasn't successful, reset to prod mode
        } else {
          this.labEnvManager.setLabEnvironment('prod');
          return false;
        }
      })
    );
  }

  // store the dev token and switch env to dev
  private devLoginSuccess(token: LabLoginResponse): void {
    this.labEnvManager.setLabEnvironment('dev');
    this.labEnvManager.storeUserJWT(`Bearer ${token.access_token}`);
  }


}
