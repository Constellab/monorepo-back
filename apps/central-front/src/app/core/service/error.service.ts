import {Inject, Injectable} from '@angular/core';
import {HttpErrorResponse} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {Router} from '@angular/router';
import {APP_CONFIG, AppConfig} from '../model/config/app-config';
import {NestError, ServerError} from '../model/global/server-error.class';
import {LoginSavedRoute} from '../utils/login-saved-route';
import {SnackBarService} from './snack-bar.service';
import {CoreTranslateService} from '../module/translate/service/core-translate.service';
import {CoreCookieService} from './core-cookie.service';
import {authExpiredCookie} from '../model/global/cookie.class';


/**
 * Manage the errors of the application
 * The errors opens a snackbar
 */
@Injectable({
  providedIn: 'root'
})
export class ErrorService {
  constructor(private snackBarService: SnackBarService,
              private translateService: CoreTranslateService,
              @Inject(APP_CONFIG) private config: AppConfig,
              private router: Router,
              private cookieService: CoreCookieService) {
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
    const serverError: ServerError = {
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
  private sessionExpired(serverError: ServerError, snackBarDuration: number): Observable<never> {
    // save the current url for rerouting after login
    const currentRoute = this.router.routerState.snapshot.url;

    // save the url if it's different
    if (currentRoute !== this.config.loginRoute) {
      LoginSavedRoute.route = currentRoute;
    }

    // for security clear the authentication expiration cookie
    // to assure the user is disconnect
    this.cookieService.removeCookie(authExpiredCookie);

    // redirect the user to the login page
    this.router.navigate([this.config.loginRoute]);

    serverError.logDetail.message = this.translateService.translate('session_expired');

    // hsow error to the user
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

  /**
   * Handle an error during deserialization of the API response
   * @param error deserialization error
   * @param classReference class tried to be converted
   */
  public handleDeserializationError(error: any, classReference: new() => any): never {
    // get the predefine error message
    const errorMessage = this.translateService.translate('error_deserialize', {
      param: {className: classReference.name}
    });

    // console logs
    console.error(errorMessage);
    console.error(error);

    // open the error dialog
    this.showError(errorMessage);

    // throw the exception
    // noinspection UnnecessaryLocalVariableJS
    const returnError: ServerError = {
      response: null,
      logDetail: {
        message: errorMessage,
        timestamp: new Date()
      }
    };
    throw returnError;
  }

  /**
   * Open an error dialog with the text
   * @param message message to display
   * @param duration snackbar duration
   */
  public showError(message: string, duration?: number): void {
    if (duration == null) {
      duration = this.config.defaultApiErrorDuration;
    }

    this.snackBarService.openErrorMessage(message, false, duration, true);
  }
}

