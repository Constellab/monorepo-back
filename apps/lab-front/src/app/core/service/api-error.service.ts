import {Inject, Injectable} from '@angular/core';
import {
  FL_API_MODULE_CONFIG,
  FlApiErrorService,
  FlApiModuleConfig,
  FlDialogService,
  FlServerError,
  FlSnackBarService,
  FlTranslateService
} from '@monorepo/front-core-lib';
import {HttpErrorResponse} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {LabApiError} from '../model/global/lab-api-error.class';
import {ErrorDetailComponent} from '../../main/component/error-detail/error-detail.component';

@Injectable()
export class ApiErrorService extends FlApiErrorService {

  constructor(snackBarService: FlSnackBarService,
              translateService: FlTranslateService,
              @Inject(FL_API_MODULE_CONFIG) config: FlApiModuleConfig,
              private dialogService: FlDialogService) {
    super(config, snackBarService, translateService);
  }

  handleServerError(error: HttpErrorResponse, hideError: boolean,
                    snackBarDuration?: number, defaultError?: string): Observable<never> {
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


}
