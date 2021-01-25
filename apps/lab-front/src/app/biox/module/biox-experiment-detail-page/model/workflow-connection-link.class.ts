import {WorkflowConnection} from './workflow-connection.class';
import {WorkflowNodeProcessable} from './workflow-node-processable.class';
import {BioxConnection} from '../../../../core/model/global/biox-connection.class';

export class WorkflowConnectionLink extends WorkflowConnection<BioxConnection> {

  constructor(public outputNode: WorkflowNodeProcessable,
              public inputNode: WorkflowNodeProcessable,
              private link: BioxConnection) {
    super(outputNode, inputNode,
      outputNode.findOutputName(link.from.getPort()),
      inputNode.findInputName(link.to.getPort()), link);
  }

}
