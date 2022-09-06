import {Component, OnInit} from '@angular/core';
import {PrWorkflowNodeInterface} from '../../model/node/pr-workflow-node-interface.class';
import {PrWorkflowNodeOuterface} from '../../model/node/pr-workflow-node-outerface.class';
import {PrWorkflowNodeDirective} from '../../directive/pr-workflow-node.directive';

type NodeType = 'interface' | 'outerface';

/**
 * Component to show interface or outerface in the workflow
 */
@Component({
  selector: 'pr-workflow-node-interface',
  templateUrl: './pr-workflow-node-interface.component.html',
  styleUrls: ['./pr-workflow-node-interface.component.scss']
})
export class PrWorkflowNodeInterfaceComponent extends PrWorkflowNodeDirective
  implements OnInit {

  type: NodeType;

  ngOnInit(): void {
    super.initNode();

    if (this.node instanceof PrWorkflowNodeInterface) {
      this.type = 'interface';
    } else if (this.node instanceof PrWorkflowNodeOuterface) {
      this.type = 'outerface';
    } else {
      console.error('Wrong type for the node');
    }
  }

}
