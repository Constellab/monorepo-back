import {Injectable} from '@angular/core';
import {
  FlApiErrorService,
  FlDialogService,
  FlLoginSavedRoute,
  FlServerError,
  FlSnackBarService,
  FlTranslateService
} from '@monorepo/front-core-lib';
import {HttpErrorResponse} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {LabApiError} from '../model/global/lab-api-error.class';
import {ErrorDetailComponent} from '../../main/component/error-detail/error-detail.component';
import {Router} from '@angular/router';
import {constLoginRoute} from '../utils/base-route';
import {LabEnvStore} from './lab-env.store';
import {LabEnvironment} from '../model/global/lab-environment.class';

@Injectable()
export class ApiErrorService extends FlApiErrorService {

  constructor(snackBarService: FlSnackBarService,
              translateService: FlTranslateService,
              private dialogService: FlDialogService,
              private labEnvManager: LabEnvStore,
              private router: Router) {
    super(snackBarService, translateService);
  }

  get defaultApiErrorDuration(): number {
    return 5000;
  }

  handleServerError(error: HttpErrorResponse, hideError: boolean,
                    snackBarDuration?: number, defaultError?: string): Observable<never> {
    console.log(error);
    const serverError: FlServerError = {
      response: error,
      logDetail: {
        message: '',
        timestamp: new Date()
      },
    };

    const apiError: LabApiError = error.error;
    // specific handling or connection error because it is not thrown by the API
    if (error.status === 0 || error.status === 504) {
      // connection lost error
      serverError.logDetail.message = this.translateService.translate('connection_lost');
    } else {
      // get the error message
      serverError.logDetail.message = this.getErrorMessage(apiError, defaultError);
    }

    // specific management for the INVALID_TOKEN
    if (apiError.code === 'gws.INVALID_TOKEN') {
      this.logoutUser();
    }

    if (!hideError) {
      // open the error snack bar
      this.showError(serverError.logDetail.message, snackBarDuration,
        () => this.dialogService.openSmallDialog(ErrorDetailComponent, {data: apiError}));
    }

    // throw the error to propagate it
    return throwError(serverError);
  }

  /**
   * Handle the error message for the not specific errors
   */
  private getErrorMessage(error: any, defaultError: string): string {
    return error.detail || defaultError;
  }

  /**
   * Manage error when the token of the user is invalid,
   * Logout the user and redirect to login
   * @private
   */
  private logoutUser(): void {
    const env: LabEnvironment = this.labEnvManager.getLabEnvironment();

    // for security clear the authentication expiration cookie
    // to assure the user is disconnect
    this.labEnvManager.clearUserJWTAndData(env === 'prod' ? 'all' : 'onlyDev');

    if (env === 'dev') {
      //switch to prod environment
      this.labEnvManager.setLabEnvironment('prod');
    }

    // save the current url for rerouting after login
    const currentRoute = this.router.url;

    // save the url if it's different
    if (currentRoute !== constLoginRoute) {
      FlLoginSavedRoute.route = currentRoute;
    }
    // redirect the user to the login page
    this.router.navigate([constLoginRoute]);

  }
}
