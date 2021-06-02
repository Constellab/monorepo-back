import {InjectionToken} from '@angular/core';
import {HttpErrorResponse} from '@angular/common/http';
import {Observable} from 'rxjs';
import {FlSnackBarService} from '../../fl-snack-bar/fl-snack-bar.service';
import {FlTranslateService} from '../../fl-translate/service/fl-translate.service';
import {FlServerError} from './fl-server-error.class';
import {ClDeserializationRef, ClPage} from '@monorepo/core-lib';

/**
 * ApiModule configuration
 */
export interface FlApiModuleConfig {
  /**
   * The api url used by the app. Every call will use this URL
   */
  apiUrl: string;

  /**
   * Default duration (in milliseconds) for the snackbar when showing an API error
   *
   * If not provided, default is 5000 milliseconds
   */
  defaultApiErrorDuration?: number;

  /**
   * Configuration of the pagination
   */
  pagination: {
    /**
     * Name of the query param page for the page number
     */
    pageQueryParam: string;

    /**
     * Name of the query param for the page size
     */
    pageSizeQueryParam: string;

    /**
     * Method to deserialize page
     * @param json returned json form the api
     * @param classReference for deserialization
     */
    deserializePage: (json: any, classReference: ClDeserializationRef) => ClPage<any>
  }

}

/**
 * @internal
 * Use to inject the configuration of the module
 *
 * Use '@Inject(FL_APP_CONFIG)' to inject it in component or service
 */
export const FL_API_MODULE_CONFIG =
  new InjectionToken<FlApiModuleConfig>('FL_API_MODULE_CONFIG');

/**
 * Service to provide to handle error of the {@link FlApiService}
 */
export abstract class FlApiErrorService {

  protected constructor(
    protected config: FlApiModuleConfig,
    protected snackBarService: FlSnackBarService,
    protected translateService: FlTranslateService
  ) {
  }

  /**
   * Method called when an error during an http call occurred
   * @param error error return by the server
   * @param hideError if true the snackbar is shown
   * @param snackBarDuration duration for the snackbar error
   * @param defaultError the default error if the api does not return an explicit error
   * @return throw a formatted error
   */
  public abstract handleServerError(error: HttpErrorResponse, hideError: boolean,
                                    snackBarDuration?: number, defaultError?: string): Observable<never>;

  /**
   * Handle an error during deserialization of the API response
   * @param error deserialization error
   * @param classReference class tried to be converted
   */
  public handleDeserializationError(error: any, classReference: ClDeserializationRef): never {
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
   */
  public showError(message: string, duration?: number): void {
    if (duration == null) {
      duration = this.config.defaultApiErrorDuration;
    }

    this.snackBarService.openErrorMessage(message, false, duration, true);
  }

}
