import {Observable} from 'rxjs';
import {distinctUntilChanged, map} from 'rxjs/operators';
import {clRxjsFilterStringLength} from './cl-rxjs-filter-string-length';
import {clRxjsOptionalDebounce} from './cl-rxjs-optional-debounce';

/**
 * RXJS operator to filter event of input to call an elastic search
 * @param debounceTime  Time of idle needed to trigger the event in millisecond
 * If another event is emitted before the timer end, the timer is reset
 * @param minLength minimum length of the string input to emit the event
 * If input length is lower than the value, the event is not emitted
 * @param lowercase if true the input is lowered case
 */
export function clRxjsElasticSearch(debounceTime: number = 350, minLength: number = 0, lowercase: boolean = false) {
  return (source: Observable<any>): Observable<string> => {
    return source.pipe(
      // if the lowercase flag is true, change the input to lowercase
      map(input => (lowercase && input != null && typeof input === 'string') ? input.toLowerCase() : input),
      // prevent emitting duplicate input in a row
      distinctUntilChanged(),
      // timer to handle idle time
      clRxjsOptionalDebounce(debounceTime),
      // filter out string null or small than length
      // place it after to filter data after the debounce
      clRxjsFilterStringLength(minLength, true),
    );
  };
}

