import {Injectable} from '@angular/core';
import {FlCleanableService, FlCleanerService, FlLocalStorageService} from '@monorepo/front-core-lib';
import {LabEnvironment} from '../model/global/lab-environment.class';
import {BehaviorSubject, Observable} from 'rxjs';
import {map} from 'rxjs/operators';

/**
 * Class to manage the env and jwt, store it and clean it
 */
@Injectable({providedIn: 'root'})
export class LabEnvStore implements FlCleanableService {

  private readonly labEnvironmentStorageKey: string = 'lab-environment';

  private _labEnvironment$: BehaviorSubject<LabEnvironment> = new BehaviorSubject('prod');

  constructor(private localStorage: FlLocalStorageService) {
    FlCleanerService.getInstance().registerService(this);
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

  public isDev$(): Observable<boolean> {
    return this.getLabEnvironment$().pipe(map(env => env === 'dev'));
  }

  public isProd$(): Observable<boolean> {
    return this.getLabEnvironment$().pipe(map(env => env === 'prod'));
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
    this.setLabEnvironment('prod');
    this.clearLabEnvironmentStorage();
  }

}
