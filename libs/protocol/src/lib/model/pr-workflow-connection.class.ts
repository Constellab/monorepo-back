import {PrWorkflowNode} from './pr-workflow-node.class';
import {PrNode} from './pr-connection.class';
import {PrWorkflowPort} from './pr-workflow-port.class';

export class PrWorkflowConnection{

  constructor(public readonly outputNode: PrWorkflowNode<PrNode>,
              public readonly inputNode: PrWorkflowNode<PrNode>,
              public readonly outputPort: PrWorkflowPort,
              public readonly inputPort: PrWorkflowPort) {
  }
}
