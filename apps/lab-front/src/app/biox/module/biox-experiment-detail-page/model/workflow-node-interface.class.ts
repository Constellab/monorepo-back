import {WorkflowNode} from './workflow-node.class';
import {WorkflowPort} from './workflow-port.class';
import {BioxInterfaceNode} from '../../../../core/model/global/biox-connection.class';


/**
 * Node for the interfaces
 */
export class WorkflowNodeInterface extends WorkflowNode<BioxInterfaceNode> {

  constructor(bioxInterfaceNode: BioxInterfaceNode, initialCoordX: number = 0, initialCoordY: number = 0) {
    super(bioxInterfaceNode.name, bioxInterfaceNode.name, bioxInterfaceNode, initialCoordX, initialCoordY);
  }

  getClassName(): string {
    return 'interface';
  }

  getHTML(): string {
    return `<biox-workflow-node-interface name="${this.nodeName}"></biox-workflow-node-interface>`;
  }

  protected initPorts(): void {
    // no input ports
    this.inputPorts = [];
    this.outputPorts = [new WorkflowPort(this.object.portName,
      WorkflowPort.getOutputDrawflowName(1), this.object.portType)];
  }
}
