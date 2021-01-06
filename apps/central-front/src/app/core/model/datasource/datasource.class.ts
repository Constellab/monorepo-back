import {Observable} from 'rxjs';

export interface Datasource<T> {
  connect(): Observable<T[]>;

  disconnect(): void;
}
