import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {WorkflowActionEvent} from '../model/workflow-drawer-event.class';
import {MatDrawer} from '@angular/material/sidenav';

/**
 * State to manager the drawer of the workflow to show detail like NodeDetail
 */
@Injectable()
export class WorkflowActionState {

  private drawer: MatDrawer;
  private action$: BehaviorSubject<WorkflowActionEvent>;

  constructor() {
  }

  public init(drawer: MatDrawer): void {
    this.drawer = drawer;
    this.action$ = new BehaviorSubject<WorkflowActionEvent>(null);
  }

  // open the drawer and emit the action
  public newAction(action: WorkflowActionEvent): void {
    this.drawer.open();
    this.action$.next(action);
  }

  public getAction$(): Observable<WorkflowActionEvent> {
    return this.action$.asObservable();
  }

  public clear(): void {
    this.action$.complete();
  }
}
