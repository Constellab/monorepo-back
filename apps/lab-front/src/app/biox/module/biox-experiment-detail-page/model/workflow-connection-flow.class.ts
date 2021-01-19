import {WorkflowConnection} from './workflow-connection.class';
import {BioxExperimentFlowStep} from '../../../../core/model/entities/biox-experiment-flow.entity';
import {WorkflowNodeProcessable} from './workflow-node-processable.class';


export class WorkflowConnectionFlow extends WorkflowConnection<BioxExperimentFlowStep> {

  constructor(public outputNode: WorkflowNodeProcessable,
              public inputNode: WorkflowNodeProcessable,
              private flowStep: BioxExperimentFlowStep) {
    super(outputNode, inputNode,
      outputNode.findOutputName(flowStep.from.process.port),
      inputNode.findInputName(flowStep.to.process.port), flowStep);
    this.checkCompatibility();
  }

  /**
   * Check if the node input and output are compatible
   * @private
   */
  private checkCompatibility(): void | never {
    const outputSpec: string[] = this.outputNode.object.process.findOutputSpec(this.flowStep.from.process.port);
    if (!this.inputNode.object.process.outputSpecIsCompatible(this.flowStep.to.process.port, outputSpec)) {
      const inputSpec: string[] = this.outputNode.object.process.findInputSpec(this.flowStep.to.process.port);
      throw new Error(`The connection input and output are incompatible. Input: ${inputSpec} Output ${outputSpec}`);
    }
  }


}
