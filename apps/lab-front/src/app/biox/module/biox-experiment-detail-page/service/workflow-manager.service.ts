import {Injectable} from '@angular/core';
import {Workflow} from '../model/workflow.class';
import {BioxProcessable, BioxProtocol, BioxProtocolGraph} from '../../../../core/model/entities/biox-processable.entity';
import {WorkflowNodeProcessable} from '../model/workflow-node-processable.class';
import {BioxExperimentFlow} from '../../../../core/model/entities/biox-experiment-flow.entity';
import {BioxJob} from '../../../../core/model/entities/biox-job.entity';
import {BioxProtocolService} from '../../../../core/entity-service/biox-protocol.service';
import {BioxConnection, BioxNode} from '../../../../core/model/global/biox-connection.class';
import {WorkflowConnectionLink} from '../model/workflow-connection-link.class';
import {WorkflowLayer} from '../model/workflow-layer.class';
import {Observable} from 'rxjs';
import {BioxProcessableBase} from '../../../../core/model/entities/biox-processable-base.entity';

@Injectable()
export class WorkflowManagerService {

  private workflow: Workflow<WorkflowNodeProcessable>;

  private readonly htmlNodeWidth: number = 200;
  private readonly htmlNodeHeight: number = 100;
  private readonly htmlDefaultNodeSpace: number = 100;
  private readonly htmlOffsetX: number = 20;
  private readonly htmlOffsetY: number = 20;

  private experimentId: string;


  constructor(private bioxProtocolService: BioxProtocolService) {
    console.log('New workflow manager');
  }

  public init(element: HTMLElement, flow: BioxExperimentFlow, experimentId: string): void {
    this.experimentId = experimentId;
    this.workflow = new Workflow(element);

    this.workflow.start();

    // init the nodes with the job list
    this.initFlow(flow);
  }

  private initFlow(flow: BioxExperimentFlow): void {
    // add all nodes
    this.addNodesAndRecursively(flow.getRootNodes(), [], 0, 0);

    // create the connections
    for (const step of flow.flows) {
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
    const job: BioxJob = BioxJob.fromProcessable(bioxProcessable, this.experimentId, parentJobId);
    this.addJobNode(job, coordX, coordY);
  }

  private addConnection(connection: BioxConnection): void {
    const outputNode: WorkflowNodeProcessable = this.workflow.findNodeWithName(connection.from.getNodeName());
    const inputNode: WorkflowNodeProcessable = this.workflow.findNodeWithName(connection.to.getNodeName());

    const workflowConnectionLink: WorkflowConnectionLink = new WorkflowConnectionLink(outputNode, inputNode, connection);
    this.workflow.addConnection(workflowConnectionLink);
  }

  public findNodeWithName(name: string): WorkflowNodeProcessable {
    return this.workflow.findNodeWithName(name);
  }

  public selectLayer(protocolId: string): void {
    if (this.workflow.hasLayer(protocolId)) {
      this.workflow.selectLayer(protocolId);
    } else {
      this.bioxProtocolService.getProtocol(protocolId).subscribe(
        protocol => this.addProtocolLayer(protocol)
      );
    }
  }

  private addProtocolLayer(protocol: BioxProtocol): void {
    this.workflow.createSubLayerIfNotExists(protocol.id, protocol.type);

    const graph: BioxProtocolGraph = protocol.data.graph;

    // add all nodes
    this.addNodesAndRecursively(graph.getRootNodes(), [], 0, 0);

    for (const links of graph.links) {
      // todo handle parentJobId
      this.addConnection(links);
    }
  }

  private addNodesAndRecursively(nodes: BioxNode[], addedNodes: BioxNode[], posX: number, basePosY: number): number {
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
      } else if (node instanceof BioxProcessableBase) {
        this.addProcessableNode(node as BioxProcessable, '', coordX, coordY);
      } else {
        throw new Error(`The node ${node.name} is not a BioxJob nor a BioxProcessableBase`);
      }

      addedNodes.push(node);

      for (const key of Object.keys(node.outputs)) {
        const outputNodes: BioxNode[] = node.outputs[key].map(output => output.getNode());
        currentPosY = this.addNodesAndRecursively(outputNodes, addedNodes, posX + 1, currentPosY);
      }
    }

    return currentPosY;
  }

  public getCurrentLayerHierarchy(): Observable<WorkflowLayer<WorkflowNodeProcessable>[]> {
    return this.workflow.getCurrentLayerHierarchy();
  }
}
