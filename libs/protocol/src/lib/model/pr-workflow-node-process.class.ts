import {PrWorkflowNode} from './pr-workflow-node.class';
import {PrProcess} from './pr-process.entity';
import {PrWorkflowPort} from './pr-workflow-port.class';
import {PrIO} from './pr-io.class';
import {PrConfigValues} from './pr-config.entity';

export class PrWorkflowNodeProcess extends PrWorkflowNode<PrProcess>{

  constructor(process: PrProcess,
              processName: string,
              x: number = 0, y: number = 0) {
    super(processName, process.title, process, x, y);
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
    if(specs){
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
    this.currentObject.config.data.values = configValues;
    // emit the current object
    this.updateObject(this.currentObject);
  }


}
