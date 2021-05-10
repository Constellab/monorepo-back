import {HttpHeaders, HttpParams} from '@angular/common/http';

export interface FlHttpGetUrlOption{
  /**
   * the N° of the page if the request if paginated
   */
  page?: number;

  /**
   * the size of the page if the request if paginated
   */
  pageSize?: number;

  /**
   * If provided it overrides the api url
   */
  overrideApiUrl?: string;
}

export interface FlHttpOption extends FlHttpGetUrlOption{
  headers?: HttpHeaders | {
    [header: string]: string | string[];
  };
  observe?: any;
  params?: HttpParams | {
    [param: string]: string | string[];
  };
  reportProgress?: boolean;

  /**
   * if set to true the call supposed that the result is a {@link ClPage}
   * and if a class reference is provided to convert the result to class with json converter,
   * the Page.content will be convert to class reference array
   */
  resultIsPaginated?: boolean;

  /**
   * If set to true the snack bar error is not shown when a http error occurs
   *
   * The default is false
   */
  hideSnackBarError?: boolean;

  /**
   * the default error if the api does not return an explicit error
   */
  defaultError?: string;

  /**
   * duration of the snackbar if an error is triggered
   */
  errorSnackBarDuration?: number;

}

