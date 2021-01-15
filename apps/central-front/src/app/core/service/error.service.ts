import {Inject, Injectable} from '@angular/core';
import {HttpErrorResponse} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {Router} from '@angular/router';
import {NestError} from '../model/global/server-error.class';
import {
  FL_API_MODULE_CONFIG,
  FlApiErrorService,
  FlApiModuleConfig,
  flAuthExpiredCookie,
  FlCookieService,
  FlLoginSavedRoute,
  FlServerError,
  FlSnackBarService,
  FlTranslateService
} from '@monorepo/front-core-lib';
import {constLoginRoute} from '../utils/base-route';


/**
 * Manage the errors of the application
 * The errors opens a snackbar
 */
@Injectable()
export class ErrorService extends FlApiErrorService {
  constructor(snackBarService: FlSnackBarService,
              translateService: FlTranslateService,
              @Inject(FL_API_MODULE_CONFIG) config: FlApiModuleConfig,
              private router: Router,
              private cookieService: FlCookieService) {
    super(config, snackBarService, translateService);
  }

  /**
   * Handle an server error
   * @param error error return by the server
   * @param hideError if true the snackbar is shown
   * @param snackBarDuration duration for the snackbar error
   * @param defaultError the default error if the api does not return an explicit error
   * @return throw a formatted error
   */
  public handleServerError(error: HttpErrorResponse, hideError: boolean = false,
                           snackBarDuration?: number, defaultError: string = 'Server error'): Observable<never> {
    const serverError: FlServerError = {
      response: error,
      logDetail: {
        message: '',
        timestamp: new Date()
      },
    };

    // specific handling or connection error because it is not thrown by the API
    if (error.status === 0 || error.status === 504) {
      // connection lost error
      serverError.logDetail.message = this.translateService.translate('connection_lost');
    } else {

      const nestError: NestError = error.error;

      // handle session expired specifically
      if (nestError.error === 'error.wrong_token') {
        return this.sessionExpired(serverError, snackBarDuration);
      }

      // get the error message
      serverError.logDetail.message = this.getErrorMessage(nestError, defaultError);
    }

    if (!hideError) {
      // open the error dialog
      this.showError(serverError.logDetail.message, snackBarDuration);
    }

    // throw the error to propagate it
    return throwError(serverError);
  }


  /**
   * Redirect the user to the login page
   */
  private sessionExpired(serverError: FlServerError, snackBarDuration: number): Observable<never> {
    // save the current url for rerouting after login
    const currentRoute = this.router.routerState.snapshot.url;

    // save the url if it's different
    if (currentRoute !== constLoginRoute) {
      FlLoginSavedRoute.route = currentRoute;
    }

    // for security clear the authentication expiration cookie
    // to assure the user is disconnect
    this.cookieService.removeCookie(flAuthExpiredCookie);

    // redirect the user to the login page
    this.router.navigate([constLoginRoute]);

    serverError.logDetail.message = this.translateService.translate('session_expired');

    // show error to the user
    this.showError(serverError.logDetail.message, snackBarDuration);

    // throw the error to propagate it
    return throwError(serverError);
  }

  /**
   * Handle the error message for the not specific errors
   */
  private getErrorMessage(error: NestError, defaultError: string): string {
    return error.message || defaultError;
  }
}

