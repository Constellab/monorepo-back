import {filter, map} from 'rxjs/operators';
import {clRxjsFilterNonNull} from './cl-rxjs-filter-non-null';
import {Observable} from 'rxjs';

/**
 * Simple RXJS operator to filter string and only emit string
 * with length equals or height than the parameters.
 *
 * Null, undefined and none string properties are ignored
 *
 *  @param minLength Default length is 0
 *  @param trimString if true the string is trimmed
 */
export function clRxjsFilterStringLength(minLength: number = 0, trimString: boolean = false) {
  return (source: Observable<any>): Observable<string> => {
    return source.pipe(
      // filter out null values
      clRxjsFilterNonNull(),
      // filter out non strings
      filter(value => typeof value === 'string'),
      // trim string if necessary
      map((value: string) => trimString ? value.trim() : value),
      // filter string with length
      filter((value: string) => value.length >= minLength)
    );
  };
}
