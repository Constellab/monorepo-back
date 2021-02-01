import {WorkflowNode} from './workflow-node.class';
import {BioxJob} from '../../../../core/model/entities/biox-job.entity';

export class WorkflowNodeProcessable extends WorkflowNode<BioxJob> {

  constructor(job: BioxJob,
              jobName: string,
              initialPosX: number = 0, initialPosY: number = 0) {
    super(jobName, job.type, job.process.getInputSpecsCount(), job.process.getOutputSpecsCount(), job, initialPosX, initialPosY);
    this.html = `<experiment-workflow-node name="${this.nodeName}"></experiment-workflow-node>`;
  }

}
