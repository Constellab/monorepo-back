import {WorkflowNode} from './workflow-node.class';


/**
 * Node for the interfaces
 */
export class WorkflowNodeInterface extends WorkflowNode<void> {

  constructor(name: string, initialCoordX: number = 0, initialCoordY: number = 0) {
    super(name, name,
      0, 1, null, 'interface', initialCoordX, initialCoordY);
    this.html = `<biox-workflow-interface name="${this.nodeName}"></biox-workflow-interface>`;
  }

  // it doesn't have an input
  findInputName(): string {
    return '';
  }

  // it has only one output
  findOutputName(): string {
    return this.getOutputName(1);
  }


}
