import {Injectable} from '@angular/core';
import {
  FlApiErrorService,
  flAuthExpiredCookie,
  FlCookieService,
  FlDialogService,
  FlLoginSavedRoute,
  FlServerError,
  FlSnackBarService,
  FlTranslateService
} from '@monorepo/front-core-lib';
import {HttpErrorResponse} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {LabApiError} from '../model/global/lab-api-error.class';
import {LabErrorDetailComponent} from '../../lab-main/component/lab-error-detail/lab-error-detail.component';
import {Router} from '@angular/router';
import {labConstLoginRoute} from '../utils/lab-base-route';
import {LabEnvStore} from './lab-env.store';
import {LabEnvironment} from '../model/global/lab-environment.class';
import {PlatformLocation} from '@angular/common';

@Injectable()
export class LabApiErrorService extends FlApiErrorService {

  constructor(snackBarService: FlSnackBarService,
              translateService: FlTranslateService,
              private dialogService: FlDialogService,
              private labEnvManager: LabEnvStore,
              private router: Router,
              private cookieService: FlCookieService,
              private platformLocation: PlatformLocation) {
    super(snackBarService, translateService);
  }

  get defaultApiErrorDuration(): number {
    return null;
  }

  handleServerError(errorResponse: HttpErrorResponse, hideError: boolean,
                    snackBarDuration?: number, defaultError?: string): Observable<never> {
    console.log(errorResponse);
    const serverError: FlServerError = {
      response: errorResponse,
      message: null,
    };

    const apiError: LabApiError = errorResponse.error;
    // specific handling or connection error because it is not thrown by the API
    if (errorResponse.status === 0 || errorResponse.status === 504) {
      // connection lost error
      serverError.message = this.translateService.translate('connection_lost');
    } else {
      // get the error message
      serverError.message = this.getErrorMessage(apiError, defaultError);
    }

    // specific management for the INVALID_TOKEN
    if (apiError.code === 'gws_core.INVALID_TOKEN') {
      this.logoutUser();
    }

    if (!hideError) {
      const detailButton = (): any => this.dialogService.openSmallDialog(LabErrorDetailComponent, {data: apiError});
      if (apiError.show_as === 'info') {
        // open the warning snack bar if the message type is warning
        this.showInfo(serverError.message, snackBarDuration, detailButton);
      } else {
        // open the error snack bar
        this.showError(serverError.message, snackBarDuration, detailButton);
      }
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

    if (env === 'dev') {
      //switch to prod environment
      this.labEnvManager.setLabEnvironment('prod');
    } else {
      // for security clear the authentication expiration cookie
      // to assure the user is disconnected
      this.cookieService.removeCookie(flAuthExpiredCookie);
    }

    // save the current url for rerouting after login
    const currentRoute = this.platformLocation.pathname;

    // save the url if it's different
    if (currentRoute !== labConstLoginRoute && currentRoute !== '/') {
      FlLoginSavedRoute.route = currentRoute;
    }
    // redirect the user to the login page, with autoRedirect param to avoid infinite loop
    this.router.navigate([labConstLoginRoute],{queryParams: {autoRedirect: false}});

  }
}
