import {Observable} from 'rxjs';

export interface FlDatasource<T> {
  connect(): Observable<T[]>;

  disconnect(): void;
}
