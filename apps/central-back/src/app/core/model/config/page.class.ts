/**
 * Generic for page requests
 */
export interface Page<T> {
  objects: T[];
  first: boolean;
  last: boolean;
  totalElements: number;
  currentPage: number;
  pageSize: number;
}
