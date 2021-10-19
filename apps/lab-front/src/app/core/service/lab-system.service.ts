import {Injectable} from '@angular/core';
import {FlApiService, FlServerError} from '@monorepo/front-core-lib';
import {Observable, of, throwError} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';
import {LabEnvStore} from './lab-env.store';

@Injectable({
  providedIn: 'root'
})
export class LabSystemService {

  private readonly route: string = 'system';

  constructor(private apiService: FlApiService,
              private labEnvStore: LabEnvStore) {
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
          return throwError(err);
        }),
        tap(() => this.labEnvStore.setLabEnvironment('prod'))
      );
  }
}
