import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {LabWorkflowActionEvent} from '../model/lab-workflow-drawer-event.class';
import {MatDrawer} from '@angular/material/sidenav';
import {LabWorkflowNodeDetailState} from './lab-workflow-node-detail.state';
import {LabWorkflowManagerState} from './lab-workflow-manager-state';
import {LabWorkflowConnection} from '../model/lab-workflow-connection.class';
import {LabConnection} from '../../../../lab-core/model/global/lab-connection.class';
import {LabProtocolLink} from '../../../../lab-core/model/entities/lab-protocol-link.entity';
import {FlDialogService} from '@monorepo/front-core-lib';
import {
  LabResourceDetailDialogComponent
} from '../../../../lab-core/entity-module/lab-resource-core/component/lab-resource-detail-dialog/lab-resource-detail-dialog.component';

/**
 * State to manager the drawer of the workflow to show detail like NodeDetail
 */
@Injectable()
export class LabWorkflowActionState {

  private drawer: MatDrawer;
  private action$: BehaviorSubject<LabWorkflowActionEvent>;

  constructor(private nodeDetailState: LabWorkflowNodeDetailState,
              private workflowManagerState: LabWorkflowManagerState,
              private dialogService: FlDialogService) {
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

  ///////////////////////// CONNECTION SELECTED ////////////////////
  public listenToConnectionSelected(): void {
    this.workflowManagerState.onConnectionSelected().subscribe(
      connection => this.onConnectionSelected(connection)
    );
  }

  private onConnectionSelected(workflowConnection: LabWorkflowConnection): void {
    const connection: LabConnection = workflowConnection.object;

    if (connection instanceof LabProtocolLink) {
      const connectionHtmlElement: HTMLElement = workflowConnection.getHTMLElement();

      if (connectionHtmlElement == null) {
        return;
      }
      this.dialogService.openBigDialog(LabResourceDetailDialogComponent, {data: connection.resource_id});
    }
  }
}
