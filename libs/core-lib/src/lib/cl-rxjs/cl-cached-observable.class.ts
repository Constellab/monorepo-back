import {Observable, of, Subject, throwError} from 'rxjs';


/**
 * Observable wrapper that works like a hot observable.
 * It subscribe to the internalObservable on first getObs call. Then it returned the cached value
 * on the next getObs calls.
 *
 * It emits last value (if exists) and next values until error or complete
 *
 * It completes when the internalObservable completes
 */
export class ClCachedObservable<T> {

  private value: T;
  private error: any;

  private subject: Subject<T>;

  private isSuccess: boolean = false;
  private isError: boolean = false;
  private isComplete: boolean = false;

  public isLoading: boolean = false;

  /**
   *
   * @param internalObservable the observable to cache
   * @param subscribe if true, subscribe to the observable on creation
   */
  constructor(private internalObservable: Observable<T>, private subscribe: boolean = false) {
    if (this.subscribe) {
      this.getObs();
    }
  }

  /**
   * return the cached observable and subscribe to the internal observable if not already subscribed
   */
  getObs(): Observable<T> {
    // if the obs is completed, send the last value or error
    if (this.isComplete) {
      if (this.isSuccess) {
        return of(this.value);
        // is error
      } else {
        return throwError(this.error);
      }
    } else {
      // if the subject is still running, return it
      if (this.subject != null) {
        return this.subject.asObservable();
      } else {
        return this.subscribeToObservable().asObservable();
      }
    }
  }

  toPromise(): Promise<T> {
    return this.getObs().toPromise();
  }


  /**
   * create the subject, subscribe to intern observable and return subject
   * This method is called only once
   */
  private subscribeToObservable(): Subject<T> {
    this.isLoading = true;
    this.subject = new Subject<T>();
    this.internalObservable.subscribe(
      value => this.onSuccess(value),
      error => this.onError(error),
      () => this.onComplete()
    );

    return this.subject;
  }

  // save and emit the value
  private onSuccess(value: T): void {
    this.value = value;
    this.isSuccess = true;
    this.subject.next(value);
  }

  // save and emit the error and mark the observable as completed
  private onError(error: any): void {
    this.error = error;
    this.isError = true;
    this.isSuccess = false;
    this.isComplete = true;
    this.isLoading = false;
    this.subject.error(error);
  }

  // mark the observable as completed
  private onComplete(): void {
    this.subject.complete();
    this.isComplete = true;
    this.isLoading = false;
  }
}
