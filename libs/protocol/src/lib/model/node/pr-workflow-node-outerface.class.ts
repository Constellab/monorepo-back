import {PrWorkflowNode} from './pr-workflow-node.class';
import {PrOuterface} from '../pr-interface.class';
import {PrWorkflowPort} from '../pr-workflow-port.class';
import {map, Observable, of} from 'rxjs';
import {FlStatus} from '@monorepo/front-core-lib';


/**
 * Node for the outerfaces
 */
export class PrWorkflowNodeOuterface extends PrWorkflowNode<PrOuterface> {
  constructor(outerfaceNode: PrOuterface, parentLayerId: string) {
    super(outerfaceNode.name, parentLayerId, outerfaceNode);
  }

  getClassName(): string {
    return 'outerface';
  }

  getHTML(): string {
    return `<pr-workflow-node-interface name="${this.nodeName}"></pr-workflow-node-interface>`;
  }


  protected initPorts(object: PrOuterface): void {
    this.inputPorts = [new PrWorkflowPort(object.portName,
      PrWorkflowPort.getInputDrawflowName(1),
      object.portType)];
    // no input ports
    this.outputPorts = [];
  }

  getStatus$(): Observable<FlStatus | null> {
    return of(null);
  }

  getSubTitle$(): Observable<string> {
    return of(null);
  }

  getTitle$(): Observable<string> {
    return this.getObject$().pipe(
      map(object => object.name)
    );
  }

  getPort(): PrWorkflowPort {
    return this.inputPorts[0];
  }

}
