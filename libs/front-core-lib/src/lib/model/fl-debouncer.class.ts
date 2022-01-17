import {Observable, Subject} from 'rxjs';
import {debounceTime} from 'rxjs/operators';

/**
 * Class to manager a debounce time on a value that is regularly modify
 *
 * Call setValue to update the value
 * The Obs of getDebouncedValue will be call only after debounceTime
 */
export class FlDebouncer<T = any> {

  // debounce time for auto save set to 1 sec
  public static readonly AUTO_SAVE_DEBOUNCE_TIME = 1000;

  private subject: Subject<T>;

  constructor(private debounceTime: number) {
    this.subject = new Subject();
  }

  public setValue(value: T): void {
    this.subject.next(value);
  }

  /**
   * Get the modified value after debounce time
   */
  public getDebouncedValue(): Observable<T> {
    return this.subject.pipe(
      debounceTime(this.debounceTime),
    );
  }

  /**
   * Wait the debounce time before completing the observable
   * This is useful to wait the last event (if it exists) before completing
   */
  public markForComplete(): void {
    setTimeout(() => this.complete(), this.debounceTime);
  }

  /**
   * Directly complete the inner observable
   */
  public complete(): void {
    this.subject.complete();
  }
}
