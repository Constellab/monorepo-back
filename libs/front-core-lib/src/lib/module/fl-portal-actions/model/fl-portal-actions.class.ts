import {BehaviorSubject, Observable} from 'rxjs';
import {FlTranslatableText} from '../../fl-translate/model/fl-translate-param';
import {filter, map} from 'rxjs/operators';

/**
 * Action to be shown in the screen
 * The observable will be call automatically and result will be emitted as {@link FlPortalActionResult}
 */
export interface FlPortalAction {

  /**
   * Action as observable Observable to subscribe
   */
  action: Observable<any>;


  /**
   * type of the action, use to filter the results
   */
  type: string;

  /**
   * Text to show beside the loader
   */
  text: FlTranslatableText;
}

/**
 * Current status of the action
 */
export type FlPortalActionStatus = 'ready' | 'waiting' | 'loading' | 'success' | 'error';

/**
 * Information used within the {@link FlPortalActionsComponent}
 */
export class FlPortalActionDetail {
  // used in the ngFor to track loaders
  symbol: symbol;

  text: FlTranslatableText;

  private actionSubject$: BehaviorSubject<FlPortalActionDetailResult> = new BehaviorSubject({status: 'waiting'});

  constructor(private action: FlPortalAction) {
    this.symbol = Symbol();
    this.text = action.text;
  }

  public callAction(): Observable<FlPortalActionResult> {
    this.emitLoading();
    this.action.action.subscribe(
      result => this.emitSuccess(result),
      error => this.emitError(error)
    );
    return this.getResult$();
  }

  private emitLoading(): void {
    this.actionSubject$.next({status: 'loading'});
  }

  private emitSuccess(result: any): void {
    this.actionSubject$.next({status: 'success', result: result});
    this.actionSubject$.complete();
  }

  private emitError(error: any): void {
    this.actionSubject$.next({status: 'error', result: error});
    this.actionSubject$.complete();
  }

  public getStatus$(): Observable<FlPortalActionStatus> {
    return this.actionSubject$.asObservable().pipe(
      map(result => result.status)
    );
  }

  public getResult$(): Observable<FlPortalActionResult> {
    return this.actionSubject$.asObservable().pipe(
      filter(result => result.status === 'success' || result.status === 'error'),
      map(result => ({
        status: result.status as any,
        result: result.result,
        action: this.action
      }))
    );
  }

  public getCurrentStatus(): FlPortalActionStatus {
    return this.actionSubject$.value.status;
  }

  public isFinished(): boolean {
    return this.getCurrentStatus() === 'success' || this.getCurrentStatus() === 'error';
  }

}

export interface FlPortalActionDetailResult {
  status: FlPortalActionStatus;
  result?: any;
}

/**
 * Result of the actions observables, can be error or success
 */
export type FlPortalActionResult<T = any> = FlPortalActionSuccess<T> | FlPortalActionError;

/**
 * Object emitted when a action ended in success
 */
export class FlPortalActionSuccess<T = any> {
  status: 'success';
  result: T;
  action: FlPortalAction;
}

/**
 * Object emitted when an action ended up in error
 */
export class FlPortalActionError<T = any> {
  status: 'error';
  result: T;
  action: FlPortalAction;
}
