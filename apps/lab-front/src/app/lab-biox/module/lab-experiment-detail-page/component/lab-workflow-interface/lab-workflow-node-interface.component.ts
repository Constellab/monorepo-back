import {Component, Input, OnInit} from '@angular/core';
import {LabWorkflowNode} from '../../model/lab-workflow-node.class';
import {LabWorkflowManagerState} from '../../state/lab-workflow-manager-state';
import {LabWorkflowNodeInterface} from '../../model/lab-workflow-node-interface.class';
import {LabWorkflowNodeOuterface} from '../../model/lab-workflow-node-outerface.class';

type NodeType = 'interface' | 'outerface';

/**
 * Component to show interface or outerface in the workflow
 */
@Component({
  selector: 'lab-workflow-node-interface',
  templateUrl: './lab-workflow-node-interface.component.html',
  styleUrls: ['./lab-workflow-node-interface.component.scss']
})
export class LabWorkflowNodeInterfaceComponent implements OnInit {

  // Name of the node
  @Input() name: string;

  type: NodeType;

  node: LabWorkflowNode<void>;


  constructor(private workflowManager: LabWorkflowManagerState) {
  }

  ngOnInit(): void {
    this.node = this.workflowManager.findNodeWithName(this.name);
    if (this.node == null) {
      console.error('Couldn\'t find node with name : ' + this.name);
    }

    if (this.node instanceof LabWorkflowNodeInterface) {
      this.type = 'interface';
    } else if (this.node instanceof LabWorkflowNodeOuterface) {
      this.type = 'outerface';
    } else {
      console.error('Wrong type for the node');
    }
  }

}
