import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {WorkflowActionEvent} from '../model/workflow-drawer-event.class';
import {MatDrawer} from '@angular/material/sidenav';
import {BioxWorkflowNodeDetailState} from './biox-workflow-node-detail.state';

/**
 * State to manager the drawer of the workflow to show detail like NodeDetail
 */
@Injectable()
export class WorkflowActionState {

  private drawer: MatDrawer;
  private action$: BehaviorSubject<WorkflowActionEvent>;

  constructor(private nodeDetailState: BioxWorkflowNodeDetailState) {
  }

  public init(drawer: MatDrawer): void {
    this.drawer = drawer;
    this.action$ = new BehaviorSubject<WorkflowActionEvent>(null);
    this.nodeDetailState.init();
  }

  // open the drawer and emit the action
  public newAction(action: WorkflowActionEvent): void {
    this.drawer.open();
    this.action$.next(action);

    if (action.action === 'selectNode') {
      this.nodeDetailState.setNode(action.processableNode);
    }
  }

  public getAction$(): Observable<WorkflowActionEvent> {
    return this.action$.asObservable();
  }

  public clear(): void {
    this.action$.complete();
    this.nodeDetailState.clear();
  }
}
