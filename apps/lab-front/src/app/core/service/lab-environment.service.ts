import {Injectable} from '@angular/core';
import {FlApiService, FlLocalStorageService} from '@monorepo/front-core-lib';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {EnvironmentHelper} from '../utils/environment.helper';
import {catchError, map} from 'rxjs/operators';

/**
 * Whether the front is connected to the prod or dev lab api
 */
export type LabEnvironment = 'prod' | 'dev';

@Injectable({providedIn: 'root'})
export class LabEnvironmentService {

  private _labEnvironment$: BehaviorSubject<LabEnvironment> = new BehaviorSubject('prod');
  private labEnvironmentStorageKey: string = 'lab-environment';

  constructor(private localStorageService: FlLocalStorageService,
              private apiService: FlApiService,
              private httpClient: HttpClient) {
  }

  /**
   * This method is trigger on startup,
   * it activates the dev environment only if
   *  - the user is in dev environment (from local storage)
   *  - the dev api is running
   */
  public init(): Observable<void> {
    // if the user is int dev mode
    if (this.getLabEnvironmentStorageValue() === 'dev') {
      // we check if the dev api is running
      return this.devApiIsRunning().pipe(
        map( isRunning => {
          if (isRunning) {
            this.setLabEnvironment('dev');
          } else {
            this.clearLocalStorage();
          }
          return;
        })
      );
    }

    return of(null);
  }

  // return true if the dev API is running
  public devApiIsRunning(): Observable<boolean> {
    return this.httpClient.get(EnvironmentHelper.getDevBaseApiUrl() + 'health-check').pipe(
      map(() => true),
      catchError(() => of(false)),
    );
  }

  /**
   * Return the environment store in the local storage with prod by default
   * @private
   */
  private getLabEnvironmentStorageValue(): LabEnvironment {
    const value: string = this.localStorageService.getItem(this.labEnvironmentStorageKey);

    if (value == null) {
      return 'prod';
    }

    if (value !== 'prod' && value !== 'dev') {
      this.clearLocalStorage();
      return 'prod';
    }

    return value;
  }


  public setLabEnvironment(environment: LabEnvironment): void {
    if (this.getLabEnvironment() === environment) return;

    // change the url for the API
    if (environment === 'prod') {
      this.apiService.setApiUrl(EnvironmentHelper.getBaseApiUrl());
    } else {
      this.apiService.setApiUrl(EnvironmentHelper.getDevBaseApiUrl());
    }

    this.localStorageService.setItem(this.labEnvironmentStorageKey, environment);
    this._labEnvironment$.next(environment);
  }

  private clearLocalStorage(): void {
    this.localStorageService.removeItem(this.labEnvironmentStorageKey);
  }

  public getLabEnvironment$(): Observable<LabEnvironment> {
    return this._labEnvironment$.asObservable();
  }

  public getLabEnvironment(): LabEnvironment {
    return this._labEnvironment$.value;
  }


}
