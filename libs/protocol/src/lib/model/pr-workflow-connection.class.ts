import {PrWorkflowNode} from './pr-workflow-node.class';
import {PrNode} from './pr-connection.class';
import {PrWorkflowPort} from './pr-workflow-port.class';
import {PrWorkflowNodeInterface} from './pr-workflow-node-interface.class';
import {PrWorkflowNodeOuterface} from './pr-workflow-node-outerface.class';

export class PrWorkflowConnection{
  private static readonly nodeInPrefix = 'node_in_node-';
  private static readonly nodeOutPrefix = 'node_out_node-';

  constructor(public readonly outputNode: PrWorkflowNode<PrNode>,
              public readonly inputNode: PrWorkflowNode<PrNode>,
              public readonly outputPort: PrWorkflowPort,
              public readonly inputPort: PrWorkflowPort) {
  }

  /**
   * return the path html element of the connection based on classes
   */
  public getHTMLElement(): HTMLElement | null {
    const element: HTMLElement = document.getElementsByClassName(
      `${PrWorkflowConnection.nodeInPrefix}${this.inputNode.nodeId}
      ${PrWorkflowConnection.nodeOutPrefix}${this.outputNode.nodeId}
      ${this.inputPort.drawFlowName}
      ${this.outputPort.drawFlowName}`)[0] as HTMLElement;

    if (element == null) {
      return null;
    }

    return element.children[0] as HTMLElement;
  }

  public isInterfaceConnection(): boolean {
    return this.outputNode instanceof PrWorkflowNodeInterface;
  }

  public isOuterfaceConnection(): boolean {
    return this.inputNode instanceof PrWorkflowNodeOuterface;
  }

  public isIOFaceConnection(): boolean {
    return this.isInterfaceConnection() || this.isOuterfaceConnection();
  }

}
