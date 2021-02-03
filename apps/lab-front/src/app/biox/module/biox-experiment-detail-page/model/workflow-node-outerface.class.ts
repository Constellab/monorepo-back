import {WorkflowNode} from './workflow-node.class';


/**
 * Node for the outerfaces
 */
export class WorkflowNodeOuterface extends WorkflowNode<void> {

  constructor(portName: string, initialPosX: number = 0, initialPosY: number = 0) {
    super(portName, portName,
      1, 0, null,'outerface', initialPosX, initialPosY);
    this.html = `<biox-workflow-interface name="${this.nodeName}"></biox-workflow-interface>`;
  }

  // it has only one input
  findInputName(): string {
    return this.getInputName(1);
  }

  // it doesn't have an output
  findOutputName(): string {
    return '';
  }


}
