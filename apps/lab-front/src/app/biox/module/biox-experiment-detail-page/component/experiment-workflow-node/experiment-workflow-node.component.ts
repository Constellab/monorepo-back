import {Component, Input, OnInit} from '@angular/core';
import {WorkflowManagerService} from '../../service/workflow-manager.service';
import {WorkflowNode} from '../../model/workflow-node.class';
import {BioxProcessable} from '../../../../../core/model/global/biox-processable.class';

/**
 * Node of an experiment in the workflow
 *
 * This component is converted to an angular element to be injectable in css
 */
@Component({
  selector: 'gen-experiment-workflow-node',
  templateUrl: './experiment-workflow-node.component.html',
  styleUrls: ['./experiment-workflow-node.component.scss']
})
export class ExperimentWorkflowNodeComponent implements OnInit {

  @Input() id: string;

  node: WorkflowNode<BioxProcessable>;

  constructor(private workflowManager: WorkflowManagerService) {
  }

  ngOnInit(): void {
    this.node = this.workflowManager.findNodeWithHTMLId(this.id);
    if (this.node == null) {
      console.error('Couldn\'t find node with html id : ' + this.id);
    }
  }

  nodeIsProtocol(): boolean {
    return this.node.object.objectType === 'protocol';
  }

}
