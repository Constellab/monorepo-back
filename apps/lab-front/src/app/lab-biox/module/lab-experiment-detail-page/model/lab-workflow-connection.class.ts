import {LabWorkflowNode} from './lab-workflow-node.class';
import {LabNode} from '../../../../lab-core/model/global/lab-connection.class';
import {LabWorkflowPort} from './lab-workflow-port.class';
import {LabWorkflowNodeInterface} from './lab-workflow-node-interface.class';
import {LabWorkflowNodeOuterface} from './lab-workflow-node-outerface.class';

export class LabWorkflowConnection {

  private static readonly nodeInPrefix = 'node_in_node-';
  private static readonly nodeOutPrefix = 'node_out_node-';

  constructor(public readonly outputNode: LabWorkflowNode<LabNode>,
              public readonly inputNode: LabWorkflowNode<LabNode>,
              public readonly outputPort: LabWorkflowPort,
              public readonly inputPort: LabWorkflowPort) {
  }

  /**
   * return the path html element of the connection based on classes
   */
  public getHTMLElement(): HTMLElement | null {
    const element: HTMLElement = document.getElementsByClassName(
      `${LabWorkflowConnection.nodeInPrefix}${this.inputNode.nodeId}
      ${LabWorkflowConnection.nodeOutPrefix}${this.outputNode.nodeId}
      ${this.inputPort.drawFlowName}
      ${this.outputPort.drawFlowName}`)[0] as HTMLElement;

    if (element == null) {
      return null;
    }

    return element.children[0] as HTMLElement;
  }

  public isInterfaceConnection(): boolean {
    return this.outputNode instanceof LabWorkflowNodeInterface;
  }

  public isOuterfaceConnection(): boolean {
    return this.inputNode instanceof LabWorkflowNodeOuterface;
  }

  public isIOFaceConnection(): boolean {
    return this.isInterfaceConnection() || this.isOuterfaceConnection();
  }

}
