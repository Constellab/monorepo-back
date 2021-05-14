import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {ClHelpService} from '@monorepo/core-lib';
import {FlCleanableService, FlCleanerService} from '../../../utils/fl-cleanable-service';
import {FlPortalAction, FlPortalActionDetail, FlPortalActionResult} from '../model/fl-portal-actions.class';
import {filter} from 'rxjs/operators';

/**
 * Service to handle the state of the actions
 *
 * This state is internal to to FlPortalActionsModule, and should not be used outside
 */
@Injectable()
export class FlPortalActionsState implements FlCleanableService {

  private actions$: BehaviorSubject<FlPortalActionDetail[]> = new BehaviorSubject<FlPortalActionDetail[]>([]);

  // each time an action success or error, it is emitting in this subject
  private results$: Subject<FlPortalActionResult> = new Subject<FlPortalActionResult>();

  constructor() {
    FlCleanerService.getInstance().registerService(this);
  }

  /**
   * Override current actions
   * @param actions
   */
  public setActions(actions: FlPortalAction | FlPortalAction[]): void {
    this.actions$.next(this.toActionDetails(actions));
  }

  /**
   * Add actions to the current ones
   * @param actions
   */
  public appendActions(actions: FlPortalAction | FlPortalAction[]): void {
    // append new actions to current actions
    const allActions: FlPortalActionDetail[] = [...this.currentActions, ...this.toActionDetails(actions)];

    this.actions$.next(allActions);
  }

  private get currentActions(): FlPortalActionDetail[] {
    return this.actions$.value;
  }

  public getActions$(): Observable<FlPortalActionDetail[]> {
    return this.actions$.asObservable();
  }

  // convert FlPortalAction to FlPortalActionDetail
  private toActionDetails(actions: FlPortalAction | FlPortalAction[]): FlPortalActionDetail[] {
    const actionsArray: FlPortalAction[] = ClHelpService.convertObjectOrArrayToArray(actions);

    return actionsArray.map(action => {
        return {...action, status: 'ready', symbol: Symbol()};
      }
    );
  }

  public emitResult(result: FlPortalActionResult): void {
    this.results$.next(result);
  }

  /**
   * Subscribe to the result
   * @param type, if provided, only emit result for actions of type
   */
  public getResult$(type?: string): Observable<FlPortalActionResult> {
    return this.results$.asObservable().pipe(
      filter(result => type == null || result.action.type === type)
    );
  }

  clean(): void {
    this.actions$.next([]);
  }


}
