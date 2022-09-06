import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {LabExperimentDetailPageState} from '../../state/lab-experiment-detail-page.state';
import {LabProtocol} from '../../../../../lab-core/model/entities/process/lab-protocol.entity';
import {LabProtocolService} from '../../../../../lab-core/entity-service/lab-protocol.service';
import {Observable, of, Subscription} from 'rxjs';
import {
  PrProtocolFlow,
  PrWorkflowActionEvent,
  PrWorkflowActionShowView,
  PrWorkflowActionState,
  PrWorkflowActionState2,
  PrWorkflowManagerState,
  PrWorkflowMode,
  PrWorkflowNode,
  PrWorkflowNodeProcess
} from '@monorepo/protocol';
import {LabWorkflowEditConfig} from '../../model/lab-workflow-edit-config.class';
import {LabWorkflowViewConfig} from '../../model/lab-workflow-view-config.class';
import {FlDialogService} from '@monorepo/front-core-lib';
import {LabResourceService} from '../../../../../lab-core/entity-service/lab-resource.service';
import {
  LabResourceDetailDialogComponent
} from '../../../../../lab-core/entity-module/lab-resource-core/component/lab-resource-detail-dialog/lab-resource-detail-dialog.component';
import {
  LabResourceViewDetailDialogComponent,
  LabResourceViewDetailDialogInput
} from '../../../../../lab-core/entity-module/lab-resource-core/component/lab-resource-view-detail-dialog/lab-resource-view-detail-dialog.component';


@Component({
  selector: 'lab-workflow',
  templateUrl: './lab-workflow.component.html',
  styleUrls: ['./lab-workflow.component.scss']
})
export class LabWorkflowComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('workflow', {static: false}) container: ElementRef<HTMLElement>;

  flowIsLoading: boolean = true;
  error: boolean = false;

  flow: PrProtocolFlow;
  mode$: Observable<PrWorkflowMode> = of('edit');

  editConfig: LabWorkflowEditConfig;
  viewConfig: LabWorkflowViewConfig;

  private subscription: Subscription;

  constructor(private workflowManagerState: PrWorkflowManagerState,
              private experimentState: LabExperimentDetailPageState,
              private protocolService: LabProtocolService,
              private resourceService: LabResourceService,
              private workflowAction: PrWorkflowActionState,
              private workflowAction2: PrWorkflowActionState2,
              private dialogService: FlDialogService) {
  }

  ngOnInit(): void {
    this.editConfig = new LabWorkflowEditConfig(this.protocolService, this.resourceService);
    this.viewConfig = new LabWorkflowViewConfig(this.dialogService, this.workflowAction2);

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
    this.experimentState.getMainProtocol$().subscribe(
      protocol => this.loadExperimentFlowSuccess(protocol),
    );
    // TODO to improve
    this.experimentState.getProtocolUpdate$().subscribe(
      protocol => this.refreshProtocol(protocol)
    );
  }

  private refreshProtocol(protocol: LabProtocol): void {
    const layer = this.workflowManagerState.workflow.findLayerWithId(protocol.id);
    if (layer) {
      for (const labProcess of Object.values(protocol.data.graph.nodes)) {
        const node: PrWorkflowNode = layer.findNodeWithName(labProcess.name);

        if (node == null) continue;
        const prProcess = this.editConfig.labProcessToPrProcess(labProcess);
        node.updateObject(prProcess);
        // TODO to improve
        if (node instanceof PrWorkflowNodeProcess) {
          node.additionalObject = labProcess;
        }
      }
    }
  }

  private loadExperimentFlowSuccess(protocol: LabProtocol): void {
    this.flow = this.editConfig.protocolToFlow(protocol);
    this.flowIsLoading = false;
  }

  openResourceDetail(resourceId: string): void {
    this.dialogService.openBigDialog(LabResourceDetailDialogComponent,
      {data: resourceId, panelClass: 'g-dialog-main-background'});
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


  get experimentIsUpdatable(): boolean {
    return this.experimentState.currentExperiment.isEditable();
  }


  private onError(): void {
    this.flowIsLoading = false;
    this.error = true;
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

}
