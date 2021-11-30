

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
