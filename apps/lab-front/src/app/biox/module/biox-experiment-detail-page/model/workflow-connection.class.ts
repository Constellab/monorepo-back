import {WorkflowNode} from './workflow-node.class';
import {BioxConnection, BioxNode} from '../../../../core/model/global/biox-connection.class';
import {WorkflowPort} from './workflow-port.class';

export class WorkflowConnection {

  private static readonly nodeInPrefix = 'node_in_node-';
  private static readonly nodeOutPrefix = 'node_out_node-';

  constructor(public readonly outputNode: WorkflowNode<BioxNode>,
              public readonly inputNode: WorkflowNode<BioxNode>,
              public readonly outputPort: WorkflowPort,
              public readonly inputPort: WorkflowPort,
              public readonly object: BioxConnection) {
  }

  /**
   * return the path html element of the connection based on classes
   */
  public getHTMLElement(): HTMLElement | null {
    const element: HTMLElement = document.getElementsByClassName(
      `${WorkflowConnection.nodeInPrefix}${this.inputNode.nodeId}
      ${WorkflowConnection.nodeOutPrefix}${this.outputNode.nodeId}
      ${this.inputPort.drawFlowName}
      ${this.outputPort.drawFlowName}`)[0] as HTMLElement;

    if (element == null) {
      return null;
    }

    return element.children[0] as HTMLElement;
  }

}
