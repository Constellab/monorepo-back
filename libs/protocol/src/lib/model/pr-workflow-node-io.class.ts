import {PrProcess} from './pr-process.entity';
import {PrWorkflowPort} from './pr-workflow-port.class';
import {PrWorkflowNodeProcess} from './pr-workflow-node-process.class';
import {Observable, of} from 'rxjs';

export class PrWorkflowNodeIo extends PrWorkflowNodeProcess {

  constructor(process: PrProcess,
              processName: string,
              // observable of the resource defined in the config
              initialCoordX: number = 0, initialCoordY: number = 0) {
    super(process, processName, initialCoordX, initialCoordY);
  }


  override getHTML(): string {
    if (this.currentObject.isSource()) {
      return `<pr-workflow-node-source name="${this.nodeName}"></pr-workflow-node-source>`;
    } else {
      return `<pr-workflow-node-output name="${this.nodeName}"></pr-workflow-node-output>`;

    }
  }

  getClassName(): string {
    if (this.currentObject.isSource()) {
      return 'task-source';
    } else {
      return 'task-output';
    }
  }


  public initPortColors(): void {
    this.setPortColor();
  }

  destroy(): void {
    super.destroy();
  }

  // if the resource is loaded, use the name of the resource, otherwise, take the node title
  public getTitle$(): Observable<string> {
    return of(this.title);
  }

  // set the port color based on selected resource
  private setPortColor(): void {
    const port = this.getPort();

    const portElement: HTMLElement = port ? this.getPortElement(port.drawFlowName): null;

    if (portElement == null) return;

    this.setPortElementColor(portElement, port.getDefaultColor());
  }

  // return the only port (output for source and input for output)
  private getPort(): PrWorkflowPort {
    if (this.currentObject.isSource()) {
      return this.outputPorts[0];
    } else {
      return this.inputPorts[0];
    }
  }
}
