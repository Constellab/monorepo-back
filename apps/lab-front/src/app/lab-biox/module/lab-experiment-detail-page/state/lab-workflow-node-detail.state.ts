import {Injectable} from '@angular/core';
import {BehaviorSubject, filter, firstValueFrom, Observable, Subscription, switchMap} from 'rxjs';
import {LabProcess} from '../../../../lab-core/model/entities/process/lab-process.entity';
import {LabExperimentDetailPageState} from './lab-experiment-detail-page.state';
import {
  PrConfigValues,
  PrWorkflowActionEvent,
  PrWorkflowActionShowView,
  PrWorkflowActionState,
  PrWorkflowNodeProcess
} from '@monorepo/protocol';
import {MatDrawer} from '@angular/material/sidenav';
import {
  LabResourceDetailDialogComponent
} from '../../../../lab-core/entity-module/lab-resource-core/component/lab-resource-detail-dialog/lab-resource-detail-dialog.component';
import {
  LabResourceViewDetailDialogComponent,
  LabResourceViewDetailDialogInput
} from '../../../../lab-core/entity-module/lab-resource-core/component/lab-resource-view-detail-dialog/lab-resource-view-detail-dialog.component';
import {FlDialogService} from '@monorepo/front-core-lib';

/**
 * State to manage the selected node to show it in the drawer
 */
@Injectable()
export class LabWorkflowNodeDetailState {

  private node$: BehaviorSubject<PrWorkflowNodeProcess>;

  private drawer: MatDrawer;
  private subscription: Subscription;

  constructor(private experimentState: LabExperimentDetailPageState,
              private actionState: PrWorkflowActionState,
              private dialogService: FlDialogService) {
  }

  public init(drawer: MatDrawer): void {
    this.node$ = new BehaviorSubject(null);
    this.drawer = drawer;

    this.subscription = this.actionState.getAction$().subscribe(
      action => this.onNewAction(action)
    );
  }

  private onNewAction(action: PrWorkflowActionEvent): void {
    if (action == null) return;

    switch (action.action) {
      case 'selectNode':
        this.setNode(action.processNode);
        this.drawer.open();
        break;
      case 'showResource':
        this.openResourceDetail(action.resourceId);
        break;
      case 'showView':
        this.openViewDetail(action);
        break;

    }
  }

  public setNode(node: PrWorkflowNodeProcess): void {
    this.node$.next(node);
  }

  public getNode$(): Observable<PrWorkflowNodeProcess> {
    return this.node$.asObservable();
  }

  public getProcess$(): Observable<LabProcess> {
    return this.getNode$().pipe(
      filter(node => node != null),
      switchMap(node => node.getObject$() as Observable<LabProcess>));
  }

  public getProcessPromise(): Promise<LabProcess> {
    return firstValueFrom(this.getProcess$());
  }

  public clear(): void {
    this.node$.complete();
    this.subscription?.unsubscribe();
  }

  // TODO to improve
  public updateConfigValues(config: PrConfigValues): void {
    const node = this.node$.value;
    this.experimentState.updateProcessConfig(node.parentLayerId, node.nodeName, config);
  }

  private openResourceDetail(resourceId: string): void {
    this.dialogService.openBigDialog(LabResourceDetailDialogComponent,
      {
        data: resourceId, panelClass: 'g-dialog-main-background',
        closeOnNavigation: true
      });
  }

  private openViewDetail(event: PrWorkflowActionShowView): void {
    const data: LabResourceViewDetailDialogInput = {
      mode: 'view',
      resourceId: event.resourceId,
      resourceName: event.resourceName,
      viewMethodName: event.config.view_config.view_method_name,
      config: event.config.view_config.config_values,
      transformers: event.config.view_config.transformers,
      saveViewConfig: true,
    };
    this.dialogService.openBigDialog(LabResourceViewDetailDialogComponent, {data: data});
  }
}
