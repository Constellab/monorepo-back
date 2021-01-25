import {filter} from 'rxjs/operators';
import {MonoTypeOperatorFunction} from 'rxjs';

/**
 * Simple RXJS operator to filter non null properties. Null and undefined properties are ignored
 */
export function clRxjsFilterNonNull<T>(): MonoTypeOperatorFunction<T> {
  return filter(value => value !== undefined && value !== null);
}
