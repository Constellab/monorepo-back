import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {ClHelpService} from '@monorepo/core-lib';
import {FlCleanableService, FlCleanerService} from '../../../utils/fl-cleanable-service';
import {FlPortalAction, FlPortalActionDetail, FlPortalActionResult} from '../model/fl-portal-actions.class';
import {filter} from 'rxjs/operators';

/**
 * Service to handle the state of the loaders
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

  public setLoaders(loaders: FlPortalAction | FlPortalAction[]): void {
    this.actions$.next(this.toActionDetails(loaders));
  }

  public appendLoaders(loaders: FlPortalAction | FlPortalAction[]): void {
    // append new loaders to current loaders
    const allLoader: FlPortalActionDetail[] = [...this.currentLoader, ...this.toActionDetails(loaders)];

    this.actions$.next(allLoader);
  }

  private get currentLoader(): FlPortalActionDetail[] {
    return this.actions$.value;
  }

  public getLoaders$(): Observable<FlPortalActionDetail[]> {
    return this.actions$.asObservable();
  }

  // convert FlPortalAction to FlPortalActionDetail
  private toActionDetails(loaders: FlPortalAction | FlPortalAction[]): FlPortalActionDetail[] {
    const loadersArray: FlPortalAction[] = ClHelpService.convertObjectOrArrayToArray(loaders);

    return loadersArray.map(loader => {
        return {...loader, status: 'ready', symbol: Symbol()};
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
