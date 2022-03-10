/**
 * Generic interface for the paginated result of API calls
 *
 * T is the type of paginated object
 */
import {Observable} from 'rxjs';

export interface ClPageI<T> {
  objects: T[];
  first: boolean;
  last: boolean;
  totalElements: number;
  currentPage: number;
  pageSize: number;
}

export class ClPage<T> implements ClPageI<T> {

  constructor(public first: boolean, public last: boolean, public totalElements: number,
              public currentPage: number, public pageSize: number, public objects: T[]) {
  }

  public static fromPagination<T>(page: number, pageSize: number, totalElements: number, objects: T[]): ClPage<T> {
    return new ClPage(page === 0, ((page + 1) * pageSize) >= totalElements, totalElements,
      page, pageSize, objects);
  }
}

/**
 * Function used by  to retrieve element that are paginated
 * @param page number of the page to get
 * @param pageSize size of the page
 * @param data any data passed to the function
 */
export type ClGetPageFunction<T> = (page: number, pageSize: number, data?: any) => Observable<ClPageI<T>>;

/**
 * Return an empty page
 */
export function clGetEmptyPage(): ClPageI<any> {
  return {
    first: true,
    last: true,
    currentPage: 0,
    pageSize: 0,
    totalElements: 0,
    objects: [],
  };
}
