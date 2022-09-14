import {PrWorkflowNode} from './pr-workflow-node.class';
import {PrInterface} from '../pr-interface.class';
import {PrWorkflowPort} from '../pr-workflow-port.class';
import {map, Observable, of} from 'rxjs';
import {FlStatus} from '@monorepo/front-core-lib';

/**
 * Node for the interfaces
 */
export class PrWorkflowNodeInterface extends PrWorkflowNode<PrInterface> {

  constructor(interfaceNode: PrInterface, parentLayerId: string) {
    super(interfaceNode.name, parentLayerId, interfaceNode);
  }

  getClassName(): string {
    return 'interface';
  }

  getHTML(): string {
    return `<pr-workflow-node-interface name="${this.nodeName}"></pr-workflow-node-interface>`;
  }

  protected initPorts(object: PrInterface): void {
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
