import {Injectable} from '@angular/core';
import {HttpErrorResponse} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {Router} from '@angular/router';
import {
  FlApiErrorService,
  flAuthExpiredCookie,
  FlCookieService,
  FlServerError,
  FlSnackBarService,
  FlTranslateService
} from '@monorepo/front-core-lib';
import {CmApiError} from '@monorepo/common-model';


/**
 * Manage the errors of the application
 * The errors opens a snackbar
 */
@Injectable()
export class HaApiErrorService extends FlApiErrorService {
  constructor(snackBarService: FlSnackBarService,
              translateService: FlTranslateService,
              private router: Router,
              private cookieService: FlCookieService) {
    super(snackBarService, translateService);
  }

  /**
   * Handle the error message for the not specific errors
   */
  private static getErrorMessage(error: CmApiError, defaultError: string): string {
    return error?.detail ?? defaultError;
  }

  get defaultApiErrorDuration(): number {
    return null;
  }

  /**
   * Handle an server error
   * @param errorResponse error return by the server
   * @param hideError if true the snackbar is shown
   * @param snackBarDuration duration for the snackbar error
   * @param defaultError the default error if the api does not return an explicit error
   * @return throw a formatted error
   */
  public handleServerError(errorResponse: HttpErrorResponse, hideError: boolean = false,
                           snackBarDuration?: number, defaultError: string = 'Server error'): Observable<never> {
    const serverError: FlServerError = {
      response: errorResponse,
      message: null,
    };

    // check if the error is formatted from nest api
    const nestError: CmApiError = errorResponse.error;
    if (nestError && nestError.code != null && nestError.instanceId != null
      && nestError.detail != null && nestError.status != null) {
      serverError.nestedError = nestError;
    }

    // specific handling or connection error because it is not thrown by the API
    if (errorResponse.status === 0 || errorResponse.status === 504) {

      // connection lost error
      serverError.message = this.translateService.translate('connection_lost');
    } else {

      // handle session expired specifically
      if (serverError.nestedError?.code === 'error.wrong_token') {
        return this.sessionExpired(serverError, snackBarDuration);
      }

      // get the error message
      serverError.message = HaApiErrorService.getErrorMessage(serverError.nestedError, defaultError);
    }

    if (!hideError) {
      // open the error dialog
      this.showError(serverError.message, snackBarDuration);
    }

    // throw the error to propagate it
    return throwError(() => serverError)


  }


  /**
   * Redirect the user to the login page
   */
  private sessionExpired(serverError: FlServerError, snackBarDuration: number): Observable<never> {

    // for security clear the authentication expiration cookie
    // to assure the user is disconnected
    this.cookieService.removeCookie(flAuthExpiredCookie);

    if(window) window.location.reload();

    serverError.message = this.translateService.translate('session_expired');

    // show error to the user
    this.showError(serverError.message, snackBarDuration);

    // throw the error to propagate it
    return throwError(() => serverError);
  }


}

