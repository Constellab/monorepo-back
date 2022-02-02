import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {LabWorkflowActionEvent} from '../model/lab-workflow-drawer-event.class';
import {MatDrawer} from '@angular/material/sidenav';
import {LabWorkflowNodeDetailState} from './lab-workflow-node-detail.state';

/**
 * State to manager the drawer of the workflow to show detail like NodeDetail
 */
@Injectable()
export class LabWorkflowActionState {

  private drawer: MatDrawer;
  private action$: BehaviorSubject<LabWorkflowActionEvent>;

  constructor(private nodeDetailState: LabWorkflowNodeDetailState) {
  }

  public init(drawer: MatDrawer): void {
    this.drawer = drawer;
    this.action$ = new BehaviorSubject<LabWorkflowActionEvent>(null);
    this.nodeDetailState.init();
  }

  // open the drawer and emit the action
  public newAction(action: LabWorkflowActionEvent): void {
    this.drawer.open();
    this.action$.next(action);

    if (action.action === 'selectNode') {
      this.nodeDetailState.setNode(action.processNode);
    }
  }

  public getAction$(): Observable<LabWorkflowActionEvent> {
    return this.action$.asObservable();
  }

  public clear(): void {
    this.action$.complete();
    this.nodeDetailState.clear();
  }
}
