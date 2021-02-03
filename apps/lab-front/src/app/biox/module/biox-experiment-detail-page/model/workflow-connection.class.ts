import {WorkflowNode} from './workflow-node.class';
import {BioxConnection, BioxNode} from '../../../../core/model/global/biox-connection.class';
import {WorkflowPort} from './workflow-port.class';

export class WorkflowConnection {

  constructor(public readonly outputNode: WorkflowNode<BioxNode>,
              public readonly inputNode: WorkflowNode<BioxNode>,
              public readonly outputPort: WorkflowPort,
              public readonly inputPort: WorkflowPort,
              public readonly object: BioxConnection) {
  }

}
