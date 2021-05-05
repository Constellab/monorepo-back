/**
 * Generic for page requests
 */
export class Page<T> {
  constructor(public objects: T[], public first: boolean, public last: boolean,
              public totalElements: number, public currentPage: number, public pageSize: number) {
  }
}
