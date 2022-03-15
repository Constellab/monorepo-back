import {BehaviorSubject, Observable} from 'rxjs';
import {FlTranslatableText} from '../../fl-translate/model/fl-translate-param';
import {filter} from 'rxjs/operators';
import {HttpEvent, HttpEventType} from '@angular/common/http';

/**
 * Action to be shown in the screen
 * The observable will be call automatically and result will be emitted as {@link FlPortalActionResult}
 */
export interface FlPortalAction<T = any> {

  /**
   * Action as observable to subscribe
   */
  action: Observable<T>;


  /**
   * type of the action, use to filter the results
   */
  type: string;

  /**
   * Text to show beside the loader
   */
  text: FlTranslatableText;

  /**
   * If true the action must return a HttpEvent and the action will display a progress bar
   */
  trackHttpEvents?: boolean;

  /**
   * Additional information to return to the result
   */
  additionalInformation?: any;

  /**
   * Method called on success with the observable result. If it returns a string, the action become a clickable link
   * @param result
   */
  successLink?: (result: T) => string;
}

/**
 * Current status of the action
 * Progress is like loading but with information about loader (like file upload)
 */
export type FlPortalActionStatus = 'ready' | 'waiting' | 'loading' | 'progress' | 'success' | 'error';

/**
 * Information used within the {@link FlPortalActionsComponent}
 */
export class FlPortalActionDetail {
  // used in the ngFor to track loaders
  symbol: symbol;

  text: FlTranslatableText;

  private actionSubject$: BehaviorSubject<FlPortalActionDetailStatusEvent> = new BehaviorSubject({status: 'waiting'});

  constructor(private action: FlPortalAction) {
    this.symbol = Symbol();
    this.text = action.text;
  }

  public callAction(): Observable<FlPortalActionResult> {
    this.emitLoading();
    this.action.action.subscribe(
      result => this.onSuccess(result),
      error => this.emitError(error)
    );
    return this.getResult$();
  }

  private emitLoading(): void {
    this.actionSubject$.next({status: 'loading'});
  }

  private onSuccess(result: any): void {
    if (this.action.trackHttpEvents) {
      this.emitProgress(result);
    } else {
      this.emitSuccess(result);
    }
  }

  private emitProgress(result: HttpEvent<any>): void {
    // if upload progress
    if (result.type === HttpEventType.UploadProgress) {
      const progress = Math.trunc((result.loaded / result.total) * 100);
      this.actionSubject$.next({status: 'progress', progressValue: progress});
    }
    // end of the request with the object
    else if (result.type === HttpEventType.Response) {
      this.emitSuccess(result.body);
      // once the upload is down, show a basic loader
    } else if (result.type === HttpEventType.DownloadProgress || result.type === HttpEventType.ResponseHeader) {
      this.emitLoading();
    }
  }

  private emitSuccess(result: any): void {
    const link = this.action.successLink ? this.action.successLink(result) : null;

    this.actionSubject$.next({
      status: 'success',
      result: result,
      action: this.action,
      additionalInformation: this.action.additionalInformation,
      link: link
    });
    this.actionSubject$.complete();
  }


  private emitError(error: any): void {
    this.actionSubject$.next({
      status: 'error',
      result: error,
      action: this.action,
      additionalInformation: this.action.additionalInformation
    });
    this.actionSubject$.complete();
  }

  public getStatusEvent$(): Observable<FlPortalActionDetailStatusEvent> {
    return this.actionSubject$.asObservable();
  }

  public getResult$(): Observable<FlPortalActionResult> {
    // only keep the success and error events
    return this.getStatusEvent$().pipe(
      filter(result => result.status === 'success' || result.status === 'error'),
    ) as any;
  }

  public getCurrentStatus(): FlPortalActionStatus {
    return this.actionSubject$.value.status;
  }

  public isFinished(): boolean {
    return this.getCurrentStatus() === 'success' || this.getCurrentStatus() === 'error';
  }

}


/**
 * Event emitted by the portal action , can be any state
 */
export type FlPortalActionDetailStatusEvent = FlPortalActionResult | FlPortalActionProgress | FlPortalActionEmpty;

/**
 * Object emitted when a action is in progress
 */
export interface FlPortalActionProgress {
  status: 'progress';
  progressValue: number; // percentage of the progress
}

/**
 * Portal Action result empty
 */
export interface FlPortalActionEmpty {
  status: 'ready' | 'waiting' | 'loading';
}


/**
 * Result of the actions observables, can be error or success
 */
export type FlPortalActionResult<T = any> = FlPortalActionSuccess<T> | FlPortalActionError;

/**
 * Object emitted when an action ended in success
 */
export interface FlPortalActionSuccess<T = any> {
  status: 'success';
  result: T;
  action: FlPortalAction;
  additionalInformation?: any;
  link?: string;
}

/**
 * Object emitted when an action ended up in error
 */
export interface FlPortalActionError<T = any> {
  status: 'error';
  result: T;
  action: FlPortalAction;
  additionalInformation?: any;
}

