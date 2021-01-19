import {WorkflowNode} from './workflow-node.class';
import {BioxProcessable} from '../../../../core/model/global/biox-processable.class';

export class WorkflowNodeProcessable extends WorkflowNode<BioxProcessable> {

  constructor(private protocol: BioxProcessable,
              posX: number = 0, posY: number = 0) {
    super(protocol.type, protocol.getInputSpecsCount(), protocol.getOutputSpecsCount(), protocol, posX, posY);
    this.html = `<experiment-workflow-node id="${this.htmlId}"></experiment-workflow-node>`;
  }
}
