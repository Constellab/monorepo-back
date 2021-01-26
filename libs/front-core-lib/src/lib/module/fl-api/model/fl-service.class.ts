import {Observable} from 'rxjs';

/**
 * Simple interface for services that have a find by id method
 */
export interface FlGetById<T> {

  getById(id: string): Observable<T>;
}
