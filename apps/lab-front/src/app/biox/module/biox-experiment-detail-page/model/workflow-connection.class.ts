import {WorkflowNode} from './workflow-node.class';
import {BioxConnection, BioxNode} from '../../../../core/model/global/biox-connection.class';

export class WorkflowConnection {

  constructor(public readonly outputNode: WorkflowNode<BioxNode>,
              public readonly inputNode: WorkflowNode<BioxNode>,
              public readonly outputName: string,
              public readonly inputName: string,
              public readonly object: BioxConnection) {
  }

}
