/**
 * Generic interface for the paginated result of API calls
 *
 * T is the type of paginated object
 */

export interface ClPageI<T> {
  objects: T[];
  first: boolean;
  last: boolean;
  totalElements: number;
  currentPage: number;
  pageSize: number;
  totalIsApproximate?: boolean; // if true the totalElements might not be accurate
}

export class ClPage<T> implements ClPageI<T> {

  constructor(public first: boolean, public last: boolean, public totalElements: number,
              public currentPage: number, public pageSize: number, public objects: T[]) {
  }

  public static fromPagination<T>(page: number, pageSize: number, totalElements: number, objects: T[]): ClPage<T> {
    return new ClPage(page === 0, ((page + 1) * pageSize) >= totalElements, totalElements,
      page, pageSize, objects);
  }

  /**
   * Call map method on objects and return a new ClPage
   * @param fn
   */
  public map<K>(fn: (value: T) => K): ClPage<K> {
    return new ClPage(this.first, this.last, this.totalElements, this.currentPage, this.pageSize,
      this.objects.map(fn));
  }
}
