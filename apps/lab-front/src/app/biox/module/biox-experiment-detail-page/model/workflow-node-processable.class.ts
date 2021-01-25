import {WorkflowNode} from './workflow-node.class';
import {BioxJob} from '../../../../core/model/entities/biox-job.entity';

export class WorkflowNodeProcessable extends WorkflowNode<BioxJob> {

  constructor(private job: BioxJob,
              jobName: string,
              initialPosX: number = 0, initialPosY: number = 0) {
    super(jobName, job.type, job.process.getInputSpecsCount(), job.process.getOutputSpecsCount(), job, initialPosX, initialPosY);
    this.html = `<experiment-workflow-node name="${this.nodeName}"></experiment-workflow-node>`;
  }

  // find the output name that match the portName
  public findOutputName(portName: string): string {
    return this.findPortName(portName, this.job.process.getOutputSpecs(), (id) => this.getOutputName(id));
  }

  // find the input name that match the portName
  public findInputName(portName: string): string {
    return this.findPortName(portName, this.job.process.getInputSpecs(), (id) => this.getInputName(id));
  }

  private findPortName(portName: string, specs: Record<string, string[]>, getName: (id: number) => string): string {
    let i = 1;
    for (const property of Object.keys(specs)) {
      if (property === portName) {
        return getName(i);
      }
      i++;
    }

    console.error('Port not found');
    return null;
  }
}
