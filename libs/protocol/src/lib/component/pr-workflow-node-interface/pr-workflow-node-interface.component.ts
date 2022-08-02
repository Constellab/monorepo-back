import {Component, Input, OnInit} from '@angular/core';
import {PrWorkflowNode} from '../../model/pr-workflow-node.class';
import {PrWorkflowManagerState} from '../../state/pr-workflow-manager-state';
import {PrWorkflowNodeInterface} from '../../model/pr-workflow-node-interface.class';
import {PrWorkflowNodeOuterface} from '../../model/pr-workflow-node-outerface.class';

type NodeType = 'interface' | 'outerface';

/**
 * Component to show interface or outerface in the workflow
 */
@Component({
  selector: 'pr-workflow-node-interface',
  templateUrl: './pr-workflow-node-interface.component.html',
  styleUrls: ['./pr-workflow-node-interface.component.scss']
})
export class PrWorkflowNodeInterfaceComponent implements OnInit {

  // Name of the node
  @Input() name: string;

  type: NodeType;

  node: PrWorkflowNode<void>;

  constructor(private workflowManager: PrWorkflowManagerState) {
  }

  ngOnInit(): void {
    this.node = this.workflowManager.findNodeWithNameInCurrentLayer(this.name);
    if (this.node == null) {
      console.error('Couldn\'t find node with name : ' + this.name);
    }

    if (this.node instanceof PrWorkflowNodeInterface) {
      this.type = 'interface';
    } else if (this.node instanceof PrWorkflowNodeOuterface) {
      this.type = 'outerface';
    } else {
      console.error('Wrong type for the node');
    }
  }

}
