import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {WorkflowManagerState} from '../../state/workflow-manager-state';
import {FlDialogService, FlPortalService} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {WorkflowActionState} from '../../state/workflow-action-state';
import {WorkflowNodeProcessable} from '../../model/workflow-node-processable.class';

/**
 * Node of an experiment in the workflow
 *
 * This component is converted to an angular element to be injectable in css
 */
@Component({
  selector: 'gen-biox-workflow-node',
  templateUrl: './biox-workflow-node.component.html',
  styleUrls: ['./biox-workflow-node.component.scss']
})
export class BioxWorkflowNodeComponent implements OnInit {

  // Name of the node
  @Input() name: string;

  @ViewChild('container', {static: true}) container: ElementRef<HTMLElement>;

  node: WorkflowNodeProcessable;

  layerIsLoading$: Observable<boolean>;

  constructor(private workflowManager: WorkflowManagerState,
              private dialogService: FlDialogService,
              private portalService: FlPortalService,
              private drawerState: WorkflowActionState) {
  }

  ngOnInit(): void {
    this.node = this.workflowManager.findNodeWithName(this.name) as WorkflowNodeProcessable;
    if (this.node == null) {
      console.error('Couldn\'t find node with name : ' + this.name);
    }

    this.layerIsLoading$ = this.workflowManager.layerIsLoading$;
  }

  nodeIsProtocol(): boolean {
    return this.node.object.isProtocol();
  }

  zoomInProtocol(): void {
    return this.workflowManager.selectLayer(this.node.nodeId);
  }

  openNodeDetail(): void {
    this.drawerState.newAction({
      action: 'selectNode',
      processableNode: this.node,
      title: this.node.title
    });
  }

  showNodeStatus(): boolean {
    return this.node.object.getStatusName() !== 'draft';
  }
}
