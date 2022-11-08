import {Injectable} from '@angular/core';
import {FlApiWithCacheService, FlServerError} from '@monorepo/front-core-lib';
import {Observable, of, throwError} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';
import {LabEnvStore} from './lab-env.store';
import {LabSystemInfo} from '../model/global/lab-system.class';
import {LabEnvironmentHelper} from '../utils/lab-environment.helper';

@Injectable({
  providedIn: 'root'
})
export class LabSystemService {

  private readonly route: string = 'system';

  constructor(private apiService: FlApiWithCacheService,
              private labEnvStore: LabEnvStore) {
  }

  public getSystemInfo(): Observable<LabSystemInfo> {
    return this.apiService.get(`${this.route}/info`, LabSystemInfo);
  }

  /**
   * Call route to completely reset the dev environment (reset tables and data)
   */
  public resetDevEnvironment(): Observable<void> {
    return this.apiService.post(`${this.route}/dev-reset`, null);
  }

  /**
   * This route stop the api (it only works on dev environment).
   * As the api is stooped, it returns an error
   */
  public killApi(): Observable<void> {
    return this.apiService.post(`${this.route}/kill`, null, null, {hideSnackBarError: true})
      .pipe(
        catchError((err: FlServerError) => {
          if (err.response.status === 0 || err.response.status === 504) {
            return of(null);
          }
          return throwError(err as any);
        }),
        tap(() => this.labEnvStore.setLabEnvironment('prod'))
      );
  }

  public getOrganizationPhotoUrl(filename: string): string {
    return LabEnvironmentHelper.getCentralApiUrl() + '/organizations/photo/' + filename;
  }

}
