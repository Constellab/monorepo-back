import {WorkflowNode} from './workflow-node.class';
import {WorkflowPort} from './workflow-port.class';
import {BioxProcessableBase} from '../../../../core/model/entities/biox-processable.entity';
import {BioxSpec} from '../../../../core/model/entities/biox-spec.entity';

/**
 * Representation of a processable (protocol or process)
 */
export class WorkflowNodeProcessable extends WorkflowNode<BioxProcessableBase> {

  constructor(processable: BioxProcessableBase,
              processableName: string,
              initialCoordX: number = 0, initialCoordY: number = 0) {
    super(processableName, processable.data.title, processable, 'node-processable', initialCoordX, initialCoordY);
    this.html = `<biox-workflow-node name="${this.nodeName}"></biox-workflow-node>`;
  }

  protected initPorts(): void {
    this.inputPorts = this.generatePorts(this.object.inputSpecs, 'input');
    this.outputPorts = this.generatePorts(this.object.outputSpecs, 'output');
  }

  // generate ports base on input or output spec
  private generatePorts(specs: Record<string, BioxSpec>, type: 'input' | 'output'): WorkflowPort[] {
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
