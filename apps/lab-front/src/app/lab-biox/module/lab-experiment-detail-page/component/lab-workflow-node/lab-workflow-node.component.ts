import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {LabWorkflowManagerState} from '../../state/lab-workflow-manager-state';
import {FlDialogService} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {LabWorkflowActionState} from '../../state/lab-workflow-action-state';
import {LabWorkflowNodeProcess} from '../../model/lab-workflow-node-process.class';

/**
 * Node of an experiment in the workflow
 *
 * This component is converted to an angular element to be injectable in html
 */
@Component({
  selector: 'lab-workflow-node',
  templateUrl: './lab-workflow-node.component.html',
  styleUrls: ['./lab-workflow-node.component.scss']
})
export class LabWorkflowNodeComponent implements OnInit {

  // Name of the node
  @Input() name: string;

  @ViewChild('container', {static: true}) container: ElementRef<HTMLElement>;

  node: LabWorkflowNodeProcess;

  layerIsLoading$: Observable<boolean>;

  constructor(private workflowManager: LabWorkflowManagerState,
              private dialogService: FlDialogService,
              private drawerState: LabWorkflowActionState) {
  }

  ngOnInit(): void {
    this.node = this.workflowManager.findNodeWithName(this.name) as LabWorkflowNodeProcess;
    if (this.node == null) {
      console.error('Couldn\'t find node with name : ' + this.name);
    }

    this.layerIsLoading$ = this.workflowManager.layerIsLoading$;
  }

  nodeIsProtocol(): boolean {
    return this.node.object.isProtocol;
  }

  zoomInProtocol(): void {
    return this.workflowManager.selectLayer(this.node.nodeId);
  }

  openNodeDetail(): void {
    this.drawerState.newAction({
      action: 'selectNode',
      processNode: this.node,
      title: this.node.title
    });
  }

  showNodeStatus(): boolean {
    return this.node.object.status.value !== 'DRAFT';
  }
}
