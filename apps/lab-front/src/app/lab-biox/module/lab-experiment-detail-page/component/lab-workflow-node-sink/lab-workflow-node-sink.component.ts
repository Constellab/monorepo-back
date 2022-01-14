import {Component, OnInit} from '@angular/core';
import {LabWorkflowNodeDirective} from '../lab-workflow-node/lab-workflow-node.directive';
import {LabWorkflowManagerState} from '../../state/lab-workflow-manager-state';
import {LabWorkflowActionState} from '../../state/lab-workflow-action-state';
import {Observable} from 'rxjs';
import {LabWorkflowNodeIO} from '../../model/lab-workflow-node-io.class';
import {FlDialogService} from '@monorepo/front-core-lib';
import {
  LabResourceDetailDialogComponent
} from '../../../../../lab-core/entity-module/lab-resource-core/component/lab-resource-detail-dialog/lab-resource-detail-dialog.component';

/**
 * Node of an experiment in the workflow specifically for the Sink process
 *
 * This component is converted to an angular element to be injectable in html
 */
@Component({
  selector: 'lab-workflow-node-sink',
  templateUrl: './lab-workflow-node-sink.component.html',
  styleUrls: ['./lab-workflow-node-sink.component.scss']
})
export class LabWorkflowNodeSinkComponent extends LabWorkflowNodeDirective implements OnInit {

  title$: Observable<string>;
  resourceId$: Observable<string>;

  node: LabWorkflowNodeIO;

  constructor(workflowManager: LabWorkflowManagerState,
              drawerState: LabWorkflowActionState,
              private dialogService: FlDialogService) {
    super(workflowManager, drawerState);
  }

  ngOnInit(): void {
    this.initNode();

    this.title$ = this.node.getTitle$();
    this.resourceId$ = this.node.getResourceId$();
  }

  openResourceDetail(resourceId: string): void {
    this.dialogService.openBigDialog(LabResourceDetailDialogComponent, {data: resourceId, closeOnNavigation: true});
  }
}
