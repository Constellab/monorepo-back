import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {PrWorkflowActionEvent} from '../model/pr-workflow-drawer-event.class';
import {PrWorkflowNodeDetailState} from './pr-workflow-node-detail-state';


/**
 * State to manager the drawer of the workflow to show detail like NodeDetail
 */
@Injectable()
export class PrWorkflowActionState {

  private action$: BehaviorSubject<PrWorkflowActionEvent>;

  constructor(private nodeDetailState: PrWorkflowNodeDetailState) {
  }

  public init(): void {
    this.action$ = new BehaviorSubject<PrWorkflowActionEvent>(null);
    this.nodeDetailState.init();
  }

  // open the drawer and emit the action
  public newAction(action: PrWorkflowActionEvent): void {

    this.action$.next(action);

    if (action.action === 'selectNode') {

      this.nodeDetailState.setNode(action.processNode);
    }
  }

  public getAction$(): Observable<PrWorkflowActionEvent> {
    return this.action$.asObservable();
  }


  public clear(): void {
    this.action$.complete();
    this.nodeDetailState.clear();
  }
}
