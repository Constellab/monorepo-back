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
              initialCoordX: number = 0, initialCoordY: number = 0) {
    super(processName, process.title, process, initialCoordX, initialCoordY);
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
}
