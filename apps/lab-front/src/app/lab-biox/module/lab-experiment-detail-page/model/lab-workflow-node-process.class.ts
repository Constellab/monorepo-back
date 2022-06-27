import {LabWorkflowNode} from './lab-workflow-node.class';
import {LabWorkflowPort} from './lab-workflow-port.class';
import {LabProcess} from '../../../../lab-core/model/entities/process/lab-process.entity';
import {LabIO} from '../../../../lab-core/model/entities/lab-io.entity';
import {LabConfigValues} from '../../../../lab-core/model/entities/lab-config.entity';

/**
 * Representation of a process (protocol or task)
 */
export class LabWorkflowNodeProcess extends LabWorkflowNode<LabProcess> {

  constructor(process: LabProcess,
              processName: string,
              x: number = 0, y: number = 0) {
    super(processName, process.title, process, x, y);
  }

  getClassName(): string {
    return 'node-process';
  }

  getHTML(): string {
    return `<lab-workflow-node name="${this.nodeName}"></lab-workflow-node>`;
  }

  protected initPorts(object: LabProcess): void {
    this.inputPorts = this.generatePorts(object.inputs, 'input');
    this.outputPorts = this.generatePorts(object.outputs, 'output');
  }

  // generate ports base on input or output spec
  private generatePorts(specs: Record<string, LabIO>, type: 'input' | 'output'): LabWorkflowPort[] {
    const ports: LabWorkflowPort[] = [];
    let i = 1;
    for (const property of Object.keys(specs)) {
      // retrieve the drawflow port name based on index
      let drawFlowName: string;
      if (type === 'input') {
        drawFlowName = LabWorkflowPort.getInputDrawflowName(i);
      } else {
        drawFlowName = LabWorkflowPort.getOutputDrawflowName(i);
      }

      // create the port
      ports.push(new LabWorkflowPort(property, drawFlowName, specs[property].specs));
      i++;
    }

    return ports;
  }

  public updateConfig(configValues: LabConfigValues): void {
    this.currentObject.config.data.values = configValues;
    // emit the current object
    this.updateObject(this.currentObject);
  }

  // method to resource typing names associated to a port
  getPortResourceTypingNames(portName: string, portType: 'input' | 'output'): string[] | null {
    const io: LabIO = portType === 'input' ? this.currentObject.inputs[portName] : this.currentObject.outputs[portName];

    if(io == null) return null;

    // return all the typing names of the spec
    return io.specs.resource_types.map(spec => spec.typing_name);
  }

}
