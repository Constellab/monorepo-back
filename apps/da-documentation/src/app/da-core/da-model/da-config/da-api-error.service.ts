import {Injectable} from '@angular/core';
import {HttpErrorResponse} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {FlApiErrorService, FlServerError, FlSnackBarService, FlTranslateService} from '@monorepo/front-core-lib';
import {CmNestApiError} from '@monorepo/common-model';


/**
 * Manage the errors of the application
 * The errors opens a snackbar
 */
@Injectable()
export class DaApiErrorService extends FlApiErrorService {
  constructor(snackBarService: FlSnackBarService,
              translateService: FlTranslateService) {
    super(snackBarService, translateService);
  }

  get defaultApiErrorDuration(): number {
    return 5000;
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
      logDetail: {
        message: '',
        timestamp: new Date()
      },
    };

    // specific handling or connection error because it is not thrown by the API
    if (errorResponse.status === 0 || errorResponse.status === 504) {
      // connection lost error
      serverError.logDetail.message = this.translateService.translate('connection_lost');
    } else {

      const nestError: CmNestApiError = errorResponse.error;

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
   * Handle the error message for the not specific errors
   */
  private getErrorMessage(error: CmNestApiError, defaultError: string): string {
    return error.detail || defaultError;
  }
}

