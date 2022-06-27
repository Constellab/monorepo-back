import {LabWorkflowNode} from './lab-workflow-node.class';
import {LabWorkflowPort} from './lab-workflow-port.class';
import {LabInterfaceNode} from '../../../../lab-core/model/global/lab-connection.class';


/**
 * Node for the interfaces
 */
export class LabWorkflowNodeInterface extends LabWorkflowNode<LabInterfaceNode> {

  constructor(interfaceNode: LabInterfaceNode, x: number = 0, y: number = 0) {
    super(interfaceNode.name, interfaceNode.name, interfaceNode, x, y);
  }

  getClassName(): string {
    return 'interface';
  }

  getHTML(): string {
    return `<lab-workflow-node-interface name="${this.nodeName}"></lab-workflow-node-interface>`;
  }

  protected initPorts(object: LabInterfaceNode): void {
    // no input ports
    this.inputPorts = [];
    this.outputPorts = [new LabWorkflowPort(object.portName,
      LabWorkflowPort.getOutputDrawflowName(1), object.portType)];
  }
}
