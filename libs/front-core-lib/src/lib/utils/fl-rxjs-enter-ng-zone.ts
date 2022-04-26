import {NgZone} from '@angular/core';
import {Observable} from 'rxjs';

/**
 * RXJS operator to force the observable into the ngZone
 * @param zone instance of ngZone
 */
export function flRxjsEnterNgZone(zone: NgZone) {
  return <T>(source: Observable<T>) =>
    new Observable<T>(observer =>
      source.subscribe({
        next: (x) => zone.run(() => observer.next(x)),
        error: (err) => zone.run(() => observer.error(err)),
        complete: () => zone.run(() => observer.complete())
      })
    );
}
