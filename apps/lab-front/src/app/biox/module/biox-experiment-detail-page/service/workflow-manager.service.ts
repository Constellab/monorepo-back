import {Injectable} from '@angular/core';
import {Workflow} from '../model/workflow.class';
import {BioxProcessable, BioxProtocol} from '../../../../core/model/entities/biox-processable.entity';
import {WorkflowNodeProcessable} from '../model/workflow-node-processable.class';
import {BioxFlow} from '../../../../core/model/entities/biox-flow.entity';
import {BioxJob} from '../../../../core/model/entities/biox-job.entity';
import {BioxConnection, BioxNode} from '../../../../core/model/global/biox-connection.class';
import {WorkflowLayer} from '../model/workflow-layer.class';
import {Observable} from 'rxjs';
import {WorkflowConnectionSelected} from '../model/workflow-event.class';
import {WorkflowConnection} from '../model/workflow-connection.class';
import {BioxExperiment} from '../../../../core/model/entities/biox-experiment.entity';
import {BioxExperimentFlowFactory} from '../../../../core/utils/biox-experiment-flow.factory';
import {BioxFlowService} from '../../../../core/entity-service/biox-flow.service';
import {BioxProtocolService} from '../../../../core/entity-service/biox-protocol.service';
import {WorkflowNode} from '../model/workflow-node.class';


// todo handle on destroy
@Injectable()
export class WorkflowManagerService {

  private workflow: Workflow<WorkflowNodeProcessable>;

  private readonly htmlNodeWidth: number = 200;
  private readonly htmlNodeHeight: number = 100;
  private readonly htmlDefaultNodeSpace: number = 100;
  private readonly htmlOffsetX: number = 20;
  private readonly htmlOffsetY: number = 20;

  private experiment: BioxExperiment;


  constructor(private bioxFlowService: BioxFlowService,
              private bioxProtocolService: BioxProtocolService) {
    console.log('New workflow manager');
  }

  public init(element: HTMLElement, flow: BioxFlow, experiment: BioxExperiment): void {
    this.experiment = experiment;
    this.workflow = new Workflow(element, 'edit');

    this.workflow.start();

    // init the nodes with the job list
    this.initFlow(flow);
  }

  private initFlow(flow: BioxFlow): void {
    // add all nodes
    this.addNodesRecursively(flow.getRootNodes(), [], 0, 0);

    // create the connections
    for (const step of flow.getNodesConnections()) {
      this.addConnection(step);
    }
  }

  private addJobNode(bioxJob: BioxJob, coordX: number = 0, coordY: number = 0): void {
    if (bioxJob.name == null) {
      bioxJob.name = this.workflow.generateNodeName();
    }

    const node: WorkflowNodeProcessable = new WorkflowNodeProcessable(bioxJob, bioxJob.name, coordX, coordY);
    this.workflow.addNode(node);
  }

  public addProcessableNode(bioxProcessable: BioxProcessable, parentJobId: string, coordX: number = 0, coordY: number = 0): void {
    const job: BioxJob = BioxExperimentFlowFactory.flowJobFromProcessable(bioxProcessable, this.experiment.id);
    this.addJobNode(job, coordX, coordY);
  }

  /**
   * Convert a BioxConnection to a WorkflowConnection and add it to the current layer
   */
  private addConnection(connection: BioxConnection): void {
    const outputNode: WorkflowNode<any> = this.findNodeWithName(connection.from.getNodeName());
    const inputNode: WorkflowNodeProcessable = this.findNodeWithName(connection.to.getNodeName());

    const inputName: string = inputNode.findInputName(connection.to.getPort());
    const outputName: string = outputNode.findOutputName(connection.from.getPort());

    const workflowConnectionLink: WorkflowConnection = new WorkflowConnection(outputNode, inputNode,
      outputName, inputName, connection);
    this.workflow.addConnection(workflowConnectionLink);
  }

  public findNodeWithName(name: string): WorkflowNodeProcessable {
    return this.workflow.findNodeWithNameInCurrentLayer(name);
  }


  public selectLayer(nodeId: string): void {
    if (this.workflow.hasLayer(nodeId)) {
      this.workflow.selectLayer(nodeId);
    } else {
      const node: WorkflowNodeProcessable = this.workflow.findNodeWithId(nodeId);

      // if the node has an ID, it is a saved job
      if (node.object.id != null) {
        this.bioxFlowService.getProtocolFlow(node.object.id).subscribe(
          flow => this.addFlowLayer(flow, nodeId)
        );
        // otherwise it's a protocol
      } else {
        this.bioxProtocolService.getProtocol(node.object.process.id).subscribe(
          protocol => this.addProtocolLayer(protocol, nodeId)
        );
      }
    }
  }

  /**
   * Convert protocol to Flow and init layer
   */
  private addProtocolLayer(protocol: BioxProtocol, nodeId: string): void {
    const experimentFlow: BioxFlow = BioxExperimentFlowFactory.bioxExperimentFromProtocol(protocol, this.experiment);
    this.addFlowLayer(experimentFlow, nodeId);
  }

  /**
   * Create a new layer and init it with the flow information
   */
  private addFlowLayer(flow: BioxFlow, nodeId: string): void {
    this.workflow.createSubLayerIfNotExists(nodeId, flow.process.type);
    this.initFlow(flow);
  }

  private addNodesRecursively(nodes: BioxNode[], addedNodes: BioxNode[], posX: number, basePosY: number): number {
    let currentPosY: number = basePosY - 1;
    for (const node of nodes) {
      currentPosY++;

      // if has already been added
      if (addedNodes.find(n => n.name === node.name) != null) {
        continue;
      }

      const coordX: number = ((this.htmlNodeWidth + this.htmlDefaultNodeSpace) * posX) + this.htmlOffsetX;
      const coordY: number = ((this.htmlNodeHeight + this.htmlDefaultNodeSpace) * currentPosY) + this.htmlOffsetY;

      // and the node and mark it as added
      if (node instanceof BioxJob) {
        this.addJobNode(node, coordX, coordY);
        // } else if (node instanceof BioxProcessableBase) {
        //   this.addProcessableNode(node as BioxProcessable, '', coordX, coordY);
      } else {
        throw new Error(`The node ${node.name} is not a BioxJob nor a BioxProcessableBase`);
      }

      addedNodes.push(node);

      for (const key of Object.keys(node.outputs)) {
        const outputNodes: BioxNode[] = node.outputs[key].map(output => output.getNode());
        currentPosY = this.addNodesRecursively(outputNodes, addedNodes, posX + 1, currentPosY);
      }
    }

    return currentPosY;
  }

  public getCurrentLayerHierarchy(): Observable<WorkflowLayer<WorkflowNodeProcessable>[]> {
    return this.workflow.getCurrentLayerHierarchy();
  }

  public onConnectionSelected(): Observable<WorkflowConnectionSelected> {
    return this.workflow.onConnectionSelected();
  }

}

