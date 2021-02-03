import {WorkflowNode} from './workflow-node.class';
import {BioxJob} from '../../../../core/model/entities/biox-job.entity';
import {WorkflowPort} from './workflow-port.class';

export class WorkflowNodeProcessable extends WorkflowNode<BioxJob> {

  constructor(job: BioxJob,
              jobName: string,
              initialCoordX: number = 0, initialCoordY: number = 0) {
    super(jobName, job.type, job, 'node-processable', initialCoordX, initialCoordY);
    this.html = `<biox-workflow-node name="${this.nodeName}"></biox-workflow-node>`;
  }

  protected initPorts(): void {
    this.inputPorts = this.generatePorts(this.object.process.getInputSpecs(), 'input');
    this.outputPorts = this.generatePorts(this.object.process.getOutputSpecs(), 'output');
  }

  // generate ports base on input or output spec
  private generatePorts(specs: Record<string, string[]>, type: 'input' | 'output'): WorkflowPort[] {
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
      ports.push(new WorkflowPort(property, drawFlowName, specs[property]));
      i++;
    }

    return ports;
  }
}
