import {LabWorkflowNode} from './lab-workflow-node.class';
import {LabOuterfaceNode} from '../../../../lab-core/model/global/lab-connection.class';
import {LabWorkflowPort} from './lab-workflow-port.class';


/**
 * Node for the outerfaces
 */
export class LabWorkflowNodeOuterface extends LabWorkflowNode<LabOuterfaceNode> {

  constructor(outerfaceNode: LabOuterfaceNode, initialPosX: number = 0, initialPosY: number = 0) {
    super(outerfaceNode.name, outerfaceNode.name, outerfaceNode, initialPosX, initialPosY);
  }

  getClassName(): string {
    return 'outerface';
  }

  getHTML(): string {
    return `<lab-workflow-node-interface name="${this.nodeName}"></lab-workflow-node-interface>`;
  }


  protected initPorts(object: LabOuterfaceNode): void {
    this.inputPorts = [new LabWorkflowPort(object.portName,
      LabWorkflowPort.getInputDrawflowName(1),
      object.portType)];
    // no input ports
    this.outputPorts = [];
  }
}
