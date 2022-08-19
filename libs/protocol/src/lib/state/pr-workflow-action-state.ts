import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {MatDrawer} from '@angular/material/sidenav';
import {PrWorkflowActionEvent} from '../model/pr-workflow-drawer-event.class';
import {PrWorkflowNodeDetailState} from './pr-workflow-node-detail-state';


/**
 * State to manager the drawer of the workflow to show detail like NodeDetail
 */
@Injectable()
export class PrWorkflowActionState {

  private drawer: MatDrawer;
  private action$: BehaviorSubject<PrWorkflowActionEvent>;

  constructor(private nodeDetailState: PrWorkflowNodeDetailState) {
  }

  public init(drawer: MatDrawer): void {
    this.drawer = drawer;
    this.action$ = new BehaviorSubject<PrWorkflowActionEvent>(null);
    this.nodeDetailState.init();
  }

  // open the drawer and emit the action
  public newAction(action: PrWorkflowActionEvent): void {
    this.drawer.open();
    this.action$.next(action);

    if (action.action === 'selectNode') {
      this.nodeDetailState.setNode(action.processNode);
    }
  }


  public clear(): void {
    this.action$.complete();
    this.nodeDetailState.clear();
  }
}
