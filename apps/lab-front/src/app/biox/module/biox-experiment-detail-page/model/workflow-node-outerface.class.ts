import {WorkflowNode} from './workflow-node.class';
import {BioxOuterfaceNode} from '../../../../core/model/global/biox-connection.class';
import {WorkflowPort} from './workflow-port.class';


/**
 * Node for the outerfaces
 */
export class WorkflowNodeOuterface extends WorkflowNode<BioxOuterfaceNode> {

  constructor(bioxOuterfaceNode: BioxOuterfaceNode, initialPosX: number = 0, initialPosY: number = 0) {
    super(bioxOuterfaceNode.name, bioxOuterfaceNode.name, bioxOuterfaceNode,
      'outerface', initialPosX, initialPosY);
    this.html = `<biox-workflow-node-interface name="${this.nodeName}"></biox-workflow-node-interface>`;
  }

  protected initPorts(): void {
    this.inputPorts = [new WorkflowPort(this.object.portName, WorkflowPort.getInputDrawflowName(1),
      this.object.portType)];
    // no input ports
    this.outputPorts = [];
  }
}
