import {Component, Input, OnInit} from '@angular/core';
import {WorkflowNode} from '../../model/workflow-node.class';
import {WorkflowManagerService} from '../../service/workflow-manager.service';
import {WorkflowNodeInterface} from '../../model/workflow-node-interface.class';
import {WorkflowNodeOuterface} from '../../model/workflow-node-outerface.class';

type NodeType = 'interface' | 'outerface';

/**
 * Component to show interface or outerface in the workflow
 */
@Component({
  selector: 'gen-biox-workflow-node-interface',
  templateUrl: './biox-workflow-node-interface.component.html',
  styleUrls: ['./biox-workflow-node-interface.component.scss']
})
export class BioxWorkflowNodeInterfaceComponent implements OnInit {

  // Name of the node
  @Input() name: string;

  type: NodeType;

  node: WorkflowNode<void>;


  constructor(private workflowManager: WorkflowManagerService) {
  }

  ngOnInit(): void {
    this.node = this.workflowManager.findNodeWithName(this.name);
    if (this.node == null) {
      console.error('Couldn\'t find node with name : ' + this.name);
    }

    if (this.node instanceof WorkflowNodeInterface) {
      this.type = 'interface';
    } else if (this.node instanceof WorkflowNodeOuterface) {
      this.type = 'outerface';
    } else {
      console.error('Wrong type for the node');
    }
  }

}
