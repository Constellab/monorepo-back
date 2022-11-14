import {AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import {LabExperimentDetailPageState} from '../../state/lab-experiment-detail-page.state';
import {Observable, of, Subscription} from 'rxjs';
import {
  PrWorkflow,
  PrWorkflowActionEvent,
  PrWorkflowActionShowView,
  PrWorkflowActionState,
  PrWorkflowManagerState,
  PrWorkflowMode
} from '@monorepo/protocol';
import {LabWorkflowEditConfig} from '../../model/lab-workflow-edit-config.class';
import {LabWorkflowViewConfig} from '../../model/lab-workflow-view-config.class';
import {FlDialogService} from '@monorepo/front-core-lib';
import {
  LabResourceDetailDialogComponent
} from '../../../../../lab-core/entity-module/lab-resource-core/component/lab-resource-detail-dialog/lab-resource-detail-dialog.component';
import {
  LabResourceViewDetailDialogComponent,
  LabResourceViewDetailDialogInput
} from '../../../../../lab-core/entity-module/lab-resource-core/component/lab-resource-view-detail-dialog/lab-resource-view-detail-dialog.component';
import {first} from 'rxjs/operators';


@Component({
  selector: 'lab-workflow',
  templateUrl: './lab-workflow.component.html',
  styleUrls: ['./lab-workflow.component.scss'],
  providers: [LabWorkflowEditConfig]
})
export class LabWorkflowComponent implements OnInit, AfterViewInit, OnDestroy {

  workflowIsLoading: boolean = true;
  error: boolean = false;

  workflow: PrWorkflow;
  mode$: Observable<PrWorkflowMode> = of('edit');

  viewConfig: LabWorkflowViewConfig;

  private subscription: Subscription;

  constructor(private workflowManagerState: PrWorkflowManagerState,
              private experimentState: LabExperimentDetailPageState,
              private workflowAction: PrWorkflowActionState,
              private dialogService: FlDialogService,
              private editConfig: LabWorkflowEditConfig) {
  }

  ngOnInit(): void {
    this.viewConfig = new LabWorkflowViewConfig(this.dialogService, this.editConfig);

    // TODO to move
    this.subscription = this.workflowAction.getAction$().subscribe(
      action => this.onNewAction(action)
    );
  }

  private onNewAction(action: PrWorkflowActionEvent): void {
    if (action == null) return;

    if (action.action === 'showResource') {
      this.openResourceDetail(action.resourceId);
    } else if (action.action === 'showView') {
      this.openViewDetail(action);
    }
  }


  ngAfterViewInit(): void {
    setTimeout(() => this.loadExperimentFlow(), 0);
  }

  private loadExperimentFlow(): void {
    // wait for the main protocol to be loaded
    this.experimentState.getMainProtocol$().pipe(first()).subscribe({
      next: () => this.loadExperimentFlowSuccess(),
      error: () => this.onError()
    });
  }

  private loadExperimentFlowSuccess(): void {
    this.workflow = this.experimentState.workflow;
    this.editConfig.setWorkflow(this.workflow);
    this.workflowIsLoading = false;
  }

  openResourceDetail(resourceId: string): void {
    this.dialogService.openBigDialog(LabResourceDetailDialogComponent,
      {
        data: resourceId, panelClass: 'g-dialog-main-background',
        closeOnNavigation: true
      });
  }

  openViewDetail(event: PrWorkflowActionShowView): void {
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


  private onError(): void {
    this.workflowIsLoading = false;
    this.error = true;
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

}
