import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {WorkflowActionEvent} from '../model/workflow-drawer-event.class';
import {MatDrawer} from '@angular/material/sidenav';
import {BioxWorkflowNodeDetailState} from './biox-workflow-node-detail.state';
import {WorkflowManagerState} from './workflow-manager-state';
import {WorkflowConnection} from '../model/workflow-connection.class';
import {BioxConnection} from '../../../../core/model/global/biox-connection.class';
import {BioxProtocolLink} from '../../../../core/model/entities/biox-protocol-link.entity';
import {ConnectedPosition} from '@angular/cdk/overlay';
import {FlPortalConfig, FlPortalService} from '@monorepo/front-core-lib';
import {BioxResourcePortalComponent} from '../../../../core/entity-module/biox-resource-core/component/biox-resource-portal/biox-resource-portal.component';

/**
 * State to manager the drawer of the workflow to show detail like NodeDetail
 */
@Injectable()
export class WorkflowActionState {

  private drawer: MatDrawer;
  private action$: BehaviorSubject<WorkflowActionEvent>;

  constructor(private nodeDetailState: BioxWorkflowNodeDetailState,
              private workflowManagerState: WorkflowManagerState,
              private portalService: FlPortalService) {
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
      this.nodeDetailState.setNode(action.processNode);
    }
  }

  public getAction$(): Observable<WorkflowActionEvent> {
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

  private onConnectionSelected(workflowConnection: WorkflowConnection): void {
    const connection: BioxConnection = workflowConnection.object;

    if (connection instanceof BioxProtocolLink) {
      const connectionHtmlElement: HTMLElement = workflowConnection.getHTMLElement();

      if (connectionHtmlElement == null) {
        return;
      }

      const position: ConnectedPosition[] = [{
        originX: 'center',
        originY: 'top',
        overlayX: 'center',
        overlayY: 'bottom',
        offsetY: -20
      }];
      const portalConfig: FlPortalConfig = this.portalService.configureRelativePortal(connectionHtmlElement, position, {
        panelClass: 'g-portal-panel',
        elevation: true,
        disposeOnNavigation: true,
        size: 'small',
        disposeOnOutsideClick: true,
        scrollStrategy: this.portalService.getCloseOnScrollStrategy()
      });

      this.portalService.createPortal(BioxResourcePortalComponent, portalConfig, connection.resource_id);
    }
  }
}
