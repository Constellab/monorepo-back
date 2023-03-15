import {Observable} from 'rxjs';
import {filter, map} from 'rxjs/operators';


export type FlStatusEventType = 'waiting' | 'loading' | 'error' | 'success'

/**
 * Simple class to generify status event (useful for subject with http calls=
 */
export type FlStatusEvent<S = any, E = any> = FlStatusEventSuccess<S>
  | FlStatusEventError<E> | FlStatusEventEmpty

export interface FlStatusEventSuccess<T = any> {
  status: 'success';
  object: T;
}

export interface FlStatusEventError<T = any> {
  status: 'error';
  error: T;
}

export interface FlStatusEventEmpty {
  status: 'waiting' | 'loading';
}

/**
 * Operator to filter FlStatusEvent to return object only when status is success
 */
export function flStatutEventSuccess<T>() {
  return (source: Observable<FlStatusEvent<T>>): Observable<T> => {
    return source.pipe(
      filter((event: FlStatusEvent) => event.status === 'success'),
      // if the lowercase flag is true, change the input to lowercase
      map((event: FlStatusEvent) => (event as FlStatusEventSuccess).object),
    );
  };
}

