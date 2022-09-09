import {PrWorkflowNode} from './pr-workflow-node.class';
import {PrInterfaceNode} from '../pr-connection.class';
import {PrWorkflowPort} from '../pr-workflow-port.class';
import {map, Observable, of} from 'rxjs';
import {FlStatus} from '@monorepo/front-core-lib';

/**
 * Node for the interfaces
 */
export class PrWorkflowNodeInterface extends PrWorkflowNode<PrInterfaceNode> {

  constructor(interfaceNode: PrInterfaceNode, x: number = 0, y: number = 0) {
    super(interfaceNode.name, interfaceNode, x, y);
  }

  getClassName(): string {
    return 'interface';
  }

  getHTML(): string {
    return `<pr-workflow-node-interface name="${this.nodeName}"></pr-workflow-node-interface>`;
  }

  protected initPorts(object: PrInterfaceNode): void {
    // no input ports
    this.inputPorts = [];
    this.outputPorts = [new PrWorkflowPort(object.portName,
      PrWorkflowPort.getOutputDrawflowName(1), object.portType)];
  }

  getStatus$(): Observable<FlStatus | null> {
    return of(null);
  }

  getTitle$(): Observable<string> {
    return this.getObject$().pipe(
      map(object => object.name)
    );
  }

  getSubTitle$(): Observable<string> {
    return of(null);
  }

  getPort(): PrWorkflowPort {
    return this.outputPorts[0];
  }


}
