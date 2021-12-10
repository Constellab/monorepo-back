import {Observable} from 'rxjs';
import {ClPageI} from '@monorepo/core-lib';

export interface FlSearchService<T> {

  // defaultSearchSortable?: boolean;

  /**
   * Advanced search
   * @param page page number for pagination
   * @param filters filter object from form
   * @param pageSize page size for the pagination
   */
  advancedSearch(page: number, pageSize: number, filters: any): Observable<ClPageI<T>>;


  /**
   * Default search called when arriving on search page (optional)
   * @param page page number for pagination
   * @param filters must be undefined for default search
   * @param sortCriteriaList list of criteria to sort pages
   * @param pageSize page size for the pagination
   */
  // defaultSearch?(page: number, filters?: any, sortCriteriaList?: LibSortCriteria[], pageSize ?: number): Observable<LibPage<T>>;
}
