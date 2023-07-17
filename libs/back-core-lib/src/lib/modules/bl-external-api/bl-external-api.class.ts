import {AxiosError, AxiosRequestConfig} from 'axios';
import {BlApiError} from '../../models/bl-nest-api-error.class';

export type BlExternalApiHttpOptionObserve = 'data' | 'response';

export interface BlExternalApiHttpOption extends AxiosRequestConfig {
  /**
   * if set to true the call supposed that the result is a {@link ClPage}
   * and if a class reference is provided to convert the result to class with json converter,
   * the Page.content will be converted to class reference array
   */
  resultIsPaginated?: boolean;


  /**
   * If response, the whole AxiosResponse is return and no conversion is made
   * If data, it only returns the content of the response
   */
  observe?: BlExternalApiHttpOptionObserve;

  /**
   * Log error in the console if true
   * Default is true
   */
  logError?: boolean;
}

export interface BlExternalApiError {
  status: number;
  message: string;
  error: AxiosError;
  knownError?: BlApiError;
}
