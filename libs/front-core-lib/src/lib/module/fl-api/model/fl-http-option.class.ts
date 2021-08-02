import {HttpHeaders, HttpParams} from '@angular/common/http';
import {ClClassReference} from '@monorepo/core-lib';

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

/**
 * Mode for the serialization
 * ClassToPlain use class transformer to convert to string
 * Stringify use basic json stringify
 * None, does not modify the object
 * If a class reference is provided, the object is converted to this class before
 * calling the serialization, it is useful when receiving serializing plain object and not classes
 *
 * The default is serialisation
 */
export type FlHttpOptionSerialization = 'classToPlain' | 'stringify' | 'none' | ClClassReference;

export interface FlHttpOption extends FlHttpGetUrlOption{
  headers?: HttpHeaders;
  observe?: any;
  responseType?: 'blob' | 'arraybuffer' | 'text' | any;
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

  /**
   * Option for the serialization
   */
  serialization?: FlHttpOptionSerialization
}

