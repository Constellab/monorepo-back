import {Observable} from 'rxjs';
import {debounceTime} from 'rxjs/operators';

/**
 * Simple RXJS operator to make the optional debounce timer optional
 *
 * If no timer is set or is set to 0 this pipe does nothing
 *
 * Otherwise it call the debounce time
 * @param time time in milliseconds for the debounce
 */
export function clRxjsOptionalDebounce(time?: number) {
  return <T>(source: Observable<T>): Observable<T> => {
    return (time == null || time === 0) ? source : source.pipe(debounceTime(time));
  };
}
