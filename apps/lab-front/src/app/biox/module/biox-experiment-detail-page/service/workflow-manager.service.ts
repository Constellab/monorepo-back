import {Injectable} from '@angular/core';
import {Workflow} from '../model/workflow.class';
import {BioxProcessable} from '../../../../core/model/global/biox-processable.class';
import {WorkflowNodeProcessable} from '../model/workflow-node-processable.class';
import {WorkflowNode} from '../model/workflow-node.class';
import {BioxExperimentFlow, BioxExperimentFlowStep} from '../../../../core/model/entities/biox-experiment-flow.entity';
import {BioxJob} from '../../../../core/model/entities/biox-job.entity';
import {WorkflowConnectionFlow} from '../model/workflow-connection-flow.class';

@Injectable()
export class WorkflowManagerService {

  private workflow: Workflow<WorkflowNodeProcessable, BioxExperimentFlowStep>;

  private readonly htmlNodeWith: number = 200;
  private readonly htmlDefaultNodeSpace: number = 100;
  private readonly htmlOffsetX: number = 20;
  private readonly htmlOffsetY: number = 20;

  constructor() {
    console.log('New workflow manager');
  }

  public init(element: HTMLElement, flow: BioxExperimentFlow): void {
    this.workflow = new Workflow(element);

    this.workflow.start();

    // init the nodes with the job list
    this.initFlow(flow);
  }

  private initFlow(flow: BioxExperimentFlow): void {
    // create the job nodes
    let i = 0;
    for (const property of Object.keys(flow.jobs)) {
      const posX: number = ((this.htmlNodeWith + this.htmlDefaultNodeSpace) * i) + this.htmlOffsetX;
      this.addJobNode(flow.jobs[property], posX, this.htmlOffsetY);
      i++;
    }

    // create the connections
    for (const step of flow.flows) {
      this.addFlowStep(step);
    }
  }

  public addJobNode(bioxJob: BioxJob, posX: number = 0, posY: number = 0): void {
    const node: WorkflowNodeProcessable = new WorkflowNodeProcessable(bioxJob, posX, posY);
    this.workflow.addNode(node);
  }

  public addProcessableNode(bioxProcessable: BioxProcessable,
                            experimentId: string, mainJobId: string,
                            posX: number = 0, posY: number = 0): void {
    const job: BioxJob = BioxJob.fromProcessable(bioxProcessable, experimentId, mainJobId);
    const node: WorkflowNodeProcessable = new WorkflowNodeProcessable(job, posX, posY);
    this.workflow.addNode(node);
  }

  public addFlowStep(flowStep: BioxExperimentFlowStep): void {
    const outputNode: WorkflowNodeProcessable = this.findNodeWithJobId(flowStep.from.jobId);
    const inputNode: WorkflowNodeProcessable = this.findNodeWithJobId(flowStep.to.jobId);

    const connection: WorkflowConnectionFlow = new WorkflowConnectionFlow(outputNode, inputNode, flowStep);
    this.workflow.addConnection(connection);
  }

  public findNodeWithJobId(jobId: string): WorkflowNodeProcessable {
    return this.workflow.nodes.find(node => node.object.id === jobId);
  }

  public findNodeWithHTMLId(htmlId: string): WorkflowNode<BioxJob> {
    return this.workflow.findNodeWithHTMLId(htmlId);
  }

  public switchModule(): void {
    this.workflow.switchModule();
  }
}
