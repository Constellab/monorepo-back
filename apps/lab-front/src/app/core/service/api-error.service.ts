import {Inject, Injectable} from '@angular/core';
import {
  FL_API_MODULE_CONFIG,
  FlApiErrorService,
  FlApiModuleConfig,
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
import {JwtManagerService} from './jwt-manager.service';

@Injectable()
export class ApiErrorService extends FlApiErrorService {

  constructor(snackBarService: FlSnackBarService,
              translateService: FlTranslateService,
              @Inject(FL_API_MODULE_CONFIG) config: FlApiModuleConfig,
              private dialogService: FlDialogService,
              private jwtManager: JwtManagerService,
              private router: Router) {
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

    // specific management for the WRONG CREDENTIALS
    if (apiError.code === 'gws.WRONG_CREDENTIALS') {
      this.handleWrongCredentialsError();
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
   * Manage error when the credentials of the user are invalid,
   * Logout the user and redirect to login
   * @private
   */
  private handleWrongCredentialsError(): void {
    // save the current url for rerouting after login
    const currentRoute = this.router.routerState.snapshot.url;
    console.log(currentRoute, this.router.url);

    // save the url if it's different
    if (currentRoute !== constLoginRoute) {
      FlLoginSavedRoute.route = currentRoute;
    }

    // for security clear the authentication expiration cookie
    // to assure the user is disconnect
    this.jwtManager.clearUserJWTAndData();

    // redirect the user to the login page
    this.router.navigate([constLoginRoute]);
  }
}
