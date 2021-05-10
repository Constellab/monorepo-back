import {FlDatasource} from './fl-datasource.class';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {filter} from 'rxjs/operators';

/**
 * Simple datasource that take an array or an array of observable
 */
export class FlDatasourceSimple<T = any> implements FlDatasource<T> {

  obs: Subject<T[]>;

  // if false the connect return nothing
  emitValue: boolean = false;

  constructor(data: T[] | Observable<T[]>) {
    if (data instanceof Observable) {
      // don't emit the v
      this.emitValue = false;
      this.obs = new BehaviorSubject(null);
      data.subscribe(
        result => {
          this.emitValue = true;
          this.obs.next(result);
        },
        error => this.obs.error(error)
      );
    } else {
      this.emitValue = true;
      this.obs = new BehaviorSubject(data);
    }
  }

  connect(): Observable<T[]> {
    return this.obs.pipe(filter(() => this.emitValue));
  }

  disconnect(): void {
  }


}
