import {FlSnackBarService} from '../../fl-snack-bar/fl-snack-bar.service';
import {FlTranslateService} from '../../fl-translate/service/fl-translate.service';
import {HttpErrorResponse} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ClDeserializationRef} from '@monorepo/core-lib';
import {FlServerError} from '../model/fl-server-error.class';

/**
 * Service to provide to handle error of the {@link FlApiService}
 */
export abstract class FlApiErrorService {

  protected constructor(
    protected snackBarService: FlSnackBarService,
    protected translateService: FlTranslateService
  ) {
  }

  /**
   * Method called when an error during an http call occurred
   * @param errorResponse error return by the server
   * @param hideError if true the snackbar is shown
   * @param snackBarDuration duration for the snackbar error
   * @param defaultError the default error if the api does not return an explicit error
   * @return throw a formatted error
   */
  public abstract handleServerError(errorResponse: HttpErrorResponse, hideError: boolean,
                                    snackBarDuration?: number, defaultError?: string): Observable<never>;

  /**
   * Default duration (in milliseconds) for the snackbar when showing an API error
   *
   * If not provided, default is 5000 milliseconds
   */
  public abstract get defaultApiErrorDuration(): number;

  /**
   * Handle an error during deserialization of the API response
   * @param error deserialization error
   * @param classReference class tried to be converted
   */
  public handleDeserializationError(error: any, classReference: ClDeserializationRef): never {
    // get the predefine error message
    const errorMessage = this.translateService.translate('flApi.error_deserialize', {
      param: {className: classReference.name}
    });

    // console logs
    console.error(errorMessage);
    console.error(error);

    // open the error dialog
    this.showError(errorMessage);

    // throw the exception
    // noinspection UnnecessaryLocalVariableJS
    const returnError: FlServerError = {
      response: null,
      logDetail: {
        message: errorMessage,
        timestamp: new Date()
      }
    };
    throw returnError;
  }

  /**
   * Open an error snackbar with the text
   * @param message message to display
   * @param duration snackbar duration
   * @param detailButton if provided, a detail button is displayed and this method is trigger on click
   * The snack bar is closed on click
   */
  protected showError(message: string, duration?: number,
                      detailButton?: (event: MouseEvent) => void): void {
    if (duration == null) {
      duration = this.defaultApiErrorDuration;
    }

    this.snackBarService.openErrorMessage(message, duration,
      {
        showCloseButton: true, detailButton: detailButton
      });
  }

}
