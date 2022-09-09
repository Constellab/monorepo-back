import {PrWorkflowNode} from './pr-workflow-node.class';
import {PrProcess, PrProcessStatus} from '../pr-process.entity';
import {PrWorkflowPort} from '../pr-workflow-port.class';
import {PrIO} from '../pr-io.class';
import {PrConfigValues} from '../pr-config.entity';
import {map, Observable} from 'rxjs';
import {FlStatus, FlTranslatableText} from '@monorepo/front-core-lib';
import {TdTypingName} from '@monorepo/technical-doc';

export class PrWorkflowNodeProcess extends PrWorkflowNode<PrProcess> {

  constructor(process: PrProcess,
              x: number = 0, y: number = 0,
              // TODO improve this
              public additionalObject: any = null) {
    super(process.name, process, x, y);
  }

  getClassName(): string {
    return 'node-process';
  }

  getHTML(): string {
    return `<pr-workflow-node name="${this.nodeName}"></pr-workflow-node>`;
  }

  protected initPorts(object: PrProcess): void {
    this.inputPorts = this.generatePorts(object.inputs, 'input');
    this.outputPorts = this.generatePorts(object.outputs, 'output');
  }

  // generate ports base on input or output spec
  private generatePorts(specs: Record<string, PrIO>, type: 'input' | 'output'): PrWorkflowPort[] {
    const ports: PrWorkflowPort[] = [];
    let i = 1;
    if (specs) {
      for (const property of Object.keys(specs)) {
        // retrieve the drawflow port name based on index
        let drawFlowName: string;
        if (type === 'input') {
          drawFlowName = PrWorkflowPort.getInputDrawflowName(i);
        } else {
          drawFlowName = PrWorkflowPort.getOutputDrawflowName(i);
        }

        // create the port
        ports.push(new PrWorkflowPort(property, drawFlowName, specs[property].specs));
        i++;
      }
    }


    return ports;
  }

  public updateConfig(configValues: PrConfigValues): void {
    this.currentObject.config.values = configValues;
    // emit the current object
    this.updateObject(this.currentObject);
  }

  getStatus$(): Observable<FlStatus<PrProcessStatus> | null> {
    return this.getObject$().pipe(
      map((process: PrProcess) => process.status)
    );
  }

  getTitle$(): Observable<FlTranslatableText> {
    return this.getObject$().pipe(
      map((process: PrProcess) => process.humanName ?? process.name)
    );
  }


  getSubTitle$(): Observable<string> {
    return this.getObject$().pipe(
      map((process: PrProcess) => {
        const typingName: TdTypingName = new TdTypingName(process.processTypingName);
        return typingName.brickName;
      })
    );
  }

  getConfigValues$(): Observable<PrConfigValues> {
    return this.getObject$().pipe(
      map((process: PrProcess) => process.config.values)
    );
  }


  isSuccess$(): Observable<boolean> {
    return this.getStatus$().pipe(
      map(status => status?.value === 'SUCCESS')
    );
  }

  // method to resource typing names associated to a port
  getPortResourceTypingNames(portName: string, portType: 'input' | 'output'): string[] | null {
    const port = portType === 'input' ? this.findInputPortByName(portName) : this.findOutputPortByName(portName);

    if (port == null) return null;

    // return all the typing names of the spec
    return port.getResourceTypingNames();
  }

}
