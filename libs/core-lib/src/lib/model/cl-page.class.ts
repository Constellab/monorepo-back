/**
 * Generic interface for the paginated result of API calls
 *
 * T is the type of paginated object
 */
import {Observable} from 'rxjs';

export interface ClPage<T> {
  objects: T[];
  first: boolean;
  last: boolean;
  totalElements: number;
  currentPage: number;
  pageSize: number;
}

/**
 * Function used by  to retrieve element that are paginated
 * @param page number of the page to get
 * @param pageSize size of the page
 */
export type ClGetPageFunction<T> = (page: number, pageSize: number) => Observable<ClPage<T>>;

/**
 * Return an empty page
 */
export function clGetEmptyPage(): ClPage<any> {
  return {
    first: true,
    last: true,
    currentPage: 0,
    pageSize: 0,
    totalElements: 0,
    objects: [],
  };
}
