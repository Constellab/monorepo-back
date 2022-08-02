import {PrWorkflowNode} from './pr-workflow-node.class';
import {PrOuterfaceNode} from './pr-connection.class';
import {PrWorkflowPort} from './pr-workflow-port.class';


/**
 * Node for the outerfaces
 */
export class PrWorkflowNodeOuterface extends PrWorkflowNode<PrOuterfaceNode> {
  constructor(outerfaceNode: PrOuterfaceNode, x: number = 0, y: number = 0) {
    super(outerfaceNode.name, outerfaceNode.name, outerfaceNode, x, y);
  }

  getClassName(): string {
    return 'outerface';
  }

  getHTML(): string {
    return `<pr-workflow-node-interface name="${this.nodeName}"></pr-workflow-node-interface>`;
  }


  protected initPorts(object: PrOuterfaceNode): void {
    this.inputPorts = [new PrWorkflowPort(object.portName,
      PrWorkflowPort.getInputDrawflowName(1),
      object.portType)];
    // no input ports
    this.outputPorts = [];
  }
}
