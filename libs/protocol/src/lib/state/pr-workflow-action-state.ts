import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {PrWorkflowActionEvent} from '../model/pr-workflow-drawer-event.class';


/**
 * State to manager the drawer of the workflow to show detail like NodeDetail
 */
@Injectable()
export class PrWorkflowActionState {

  private action$: BehaviorSubject<PrWorkflowActionEvent>;

  constructor() {
  }

  public init(): void {
    this.action$ = new BehaviorSubject<PrWorkflowActionEvent>(null);
  }

  // open the drawer and emit the action
  public newAction(action: PrWorkflowActionEvent): void {
    this.action$.next(action);
  }

  public getAction$(): Observable<PrWorkflowActionEvent> {
    return this.action$.asObservable();
  }


  public clear(): void {
    this.action$.complete();
  }
}
