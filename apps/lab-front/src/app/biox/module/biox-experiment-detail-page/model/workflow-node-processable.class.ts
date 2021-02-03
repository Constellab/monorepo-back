import {WorkflowNode} from './workflow-node.class';
import {BioxJob} from '../../../../core/model/entities/biox-job.entity';

export class WorkflowNodeProcessable extends WorkflowNode<BioxJob> {

  constructor(job: BioxJob,
              jobName: string,
              initialCoordX: number = 0, initialCoordY: number = 0) {
    super(jobName, job.type, job.process.getInputSpecsCount(), job.process.getOutputSpecsCount(), job,
      'node-processable', initialCoordX, initialCoordY);
    this.html = `<biox-workflow-node name="${this.nodeName}"></biox-workflow-node>`;
  }

  // find the input name that match the portName
  public findInputName(portName: string): string {
    return this.findPortName(portName, this.object.inputs, 'input');
  }

  // find the output name that match the portName
  public findOutputName(portName: string): string {
    return this.findPortName(portName, this.object.outputs, 'output');
  }
}
