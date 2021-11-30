import {WorkflowNode} from './workflow-node.class';
import {WorkflowPort} from './workflow-port.class';
import {BioxProcess} from '../../../../core/model/entities/process/biox-process.entity';
import {BioxIO} from '../../../../core/model/entities/biox-io.entity';

/**
 * Representation of a process (protocol or task)
 */
export class WorkflowNodeProcess extends WorkflowNode<BioxProcess> {

  constructor(process: BioxProcess,
              processName: string,
              initialCoordX: number = 0, initialCoordY: number = 0) {
    super(processName, process.title, process, initialCoordX, initialCoordY);
  }

  getClassName(): string {
    return 'node-process';
  }

  getHTML(): string {
    return `<biox-workflow-node name="${this.nodeName}"></biox-workflow-node>`;
  }


  protected initPorts(): void {
    this.inputPorts = this.generatePorts(this.object.inputs, 'input');
    this.outputPorts = this.generatePorts(this.object.outputs, 'output');
  }

  // generate ports base on input or output spec
  private generatePorts(specs: Record<string, BioxIO>, type: 'input' | 'output'): WorkflowPort[] {
    const ports: WorkflowPort[] = [];
    let i = 1;
    for (const property of Object.keys(specs)) {
      // retrieve the drawflow port name based on index
      let drawFlowName: string;
      if (type === 'input') {
        drawFlowName = WorkflowPort.getInputDrawflowName(i);
      } else {
        drawFlowName = WorkflowPort.getOutputDrawflowName(i);
      }

      // create the port
      ports.push(new WorkflowPort(property, drawFlowName, specs[property].specs));
      i++;
    }

    return ports;
  }
}
