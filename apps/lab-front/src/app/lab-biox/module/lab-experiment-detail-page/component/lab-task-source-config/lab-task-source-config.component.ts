import {Component, OnDestroy, OnInit} from '@angular/core';
import {LabWorkflowNodeDetailState} from '../../state/lab-workflow-node-detail.state';
import {Observable, Subscription} from 'rxjs';
import {FlDialogService, FlStatusEvent} from '@monorepo/front-core-lib';
import {LabResource} from '../../../../../lab-core/model/entities/resource/lab-resource.entity';
import {
  LabSelectResourceDialogComponent
} from '../../../../../lab-core/entity-module/lab-resource-core/component/lab-select-resource-dialog/lab-select-resource-dialog.component';
import {LabWorkflowNodeIO} from '../../model/lab-workflow-node-io.class';
import {LabExperimentDetailPageState} from '../../state/lab-experiment-detail-page.state';

/**
 * Specific component to configure a task of type gws.plug.Source
 *
 * This allows the user to select a resource
 */
@Component({
  selector: 'lab-task-source-config',
  templateUrl: './lab-task-source-config.component.html',
  styleUrls: ['./lab-task-source-config.component.scss']
})
export class LabTaskSourceConfigComponent implements OnInit, OnDestroy {

  selectedResource$: Observable<FlStatusEvent<LabResource>>;

  isEditable$: Observable<boolean>;

  private node: LabWorkflowNodeIO;
  private subscription: Subscription;


  constructor(private nodeDetail: LabWorkflowNodeDetailState,
              private dialogService: FlDialogService,
              private experimentState: LabExperimentDetailPageState) {
  }

  ngOnInit(): void {
    this.subscription = this.nodeDetail.getNode$().subscribe(
      node => this.setNode(node as LabWorkflowNodeIO)
    );

    this.isEditable$ = this.experimentState.isEditable$();
  }

  private setNode(node: LabWorkflowNodeIO): void {
    // security to prevent not source node
    // it can be called because the state change before the component is destroy
    if (!(node instanceof LabWorkflowNodeIO)) return;
    this.node = node;
    this.selectedResource$ = node.getLoadedResource$();
  }

  openResourceSelection(): void {
    this.dialogService.openBigDialog(LabSelectResourceDialogComponent).afterClosed().subscribe(
      resource => this.onResourceSelectionClosed(resource)
    );
  }

  private onResourceSelectionClosed(resource?: LabResource): void {
    if (resource) {
      this.nodeDetail.updateConfigValues({resource_id: resource.id});
      this.node.setLoadedResource(resource);
    }
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }


}
