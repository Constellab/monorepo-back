import {Injectable} from '@angular/core';
import {Workflow, WorkflowMode} from '../model/workflow.class';
import {WorkflowNodeProcessable} from '../model/workflow-node-processable.class';
import {BioxProcessableBase, BioxProtocol} from '../../../../core/model/entities/biox-processable.entity';
import {BioxConnection, BioxInterfaceNode, BioxNode, BioxOuterfaceNode} from '../../../../core/model/global/biox-connection.class';
import {WorkflowLayer} from '../model/workflow-layer.class';
import {Observable} from 'rxjs';
import {WorkflowConnection} from '../model/workflow-connection.class';
import {BioxExperiment} from '../../../../core/model/entities/biox-experiment.entity';
import {BioxExperimentFlowFactory} from '../../../../core/utils/biox-experiment-flow.factory';
import {BioxProtocolService} from '../../../../core/entity-service/biox-protocol.service';
import {WorkflowNode} from '../model/workflow-node.class';
import {WorkflowNodeInterface} from '../model/workflow-node-interface.class';
import {WorkflowNodeOuterface} from '../model/workflow-node-outerface.class';
import {WorkflowPort} from '../model/workflow-port.class';

/**
 * State for the workflow, it is created for the module and can only manage on state a the time
 */
@Injectable()
export class WorkflowManagerState {

  public workflow: Workflow;

  private readonly htmlNodeWidth: number = 200;
  private readonly htmlNodeHeight: number = 100;
  private readonly htmlDefaultNodeSpace: number = 100;
  private readonly htmlOffsetX: number = 20;
  private readonly htmlOffsetY: number = 20;

  private experiment: BioxExperiment;

  private idGenerator: number = 0;

  constructor(private bioxProtocolService: BioxProtocolService) {
    console.log('New workflow manager');
  }

  public init(element: HTMLElement, flow: BioxProtocol, experiment: BioxExperiment): void {
    this.clear();
    this.experiment = experiment;
    this.workflow = new Workflow(element, 'edit');

    this.workflow.start();

    // init the nodes with the job list
    this.initFlow(flow);
  }


  //////////////////////// LAYER ////////////////////////////

  public selectLayer(nodeId: string): void {
    if (this.workflow.hasLayer(nodeId)) {
      this.workflow.selectLayer(nodeId);
    } else {
      const node: WorkflowNode<any> = this.workflow.findNodeWithId(nodeId);

      this.bioxProtocolService.getProtocol(node.object.id).subscribe(
        protocol => this.addFlowLayer(protocol, nodeId)
      );
    }
  }

  /**
   * Create a new layer and init it with the flow information
   */
  private addFlowLayer(flow: BioxProtocol, nodeId: string): void {
    this.workflow.createSubLayerIfNotExists(nodeId, flow.data.title);
    this.initFlow(flow);
  }

  /**
   * Convert protocol to Flow and init layer
   */
  private addProtocolLayer(protocol: BioxProtocol, nodeId: string): void {
    const experimentFlow: BioxProtocol = BioxExperimentFlowFactory.bioxExperimentFromProtocol(protocol, this.experiment);
    this.addFlowLayer(experimentFlow, nodeId);
  }


  //////////////////////// NODE ////////////////////////////

  public addProcessableNode(bioxProcessable: BioxProcessableBase, parentJobId: string, coordX: number = 0, coordY: number = 0): void {
    const node: WorkflowNode<any> = this.createNodeFromProcessable(bioxProcessable, coordX, coordY);
    this.addNode(node);
  }

  private createNodeFromProcessable(processable: BioxProcessableBase, coordX: number = 0, coordY: number = 0): WorkflowNodeProcessable {
    if (processable.name == null) {
      processable.name = this.workflow.generateNodeName();
    }

    return new WorkflowNodeProcessable(processable, processable.name, coordX, coordY);
  }

  public addInterface(): void {
    const interfaceNode: BioxInterfaceNode = new BioxInterfaceNode();
    interfaceNode.portName = this.generateId('i_');
    interfaceNode.name = interfaceNode.portName;
    interfaceNode.portType = null;
    // todo see pos
    this.addBioxNodeOnPosition(interfaceNode, 0, 0);
  }

  public addOuterface(): void {
    const outerfaceNode: BioxOuterfaceNode = new BioxOuterfaceNode();
    outerfaceNode.portName = this.generateId('o_');
    outerfaceNode.name = outerfaceNode.portName;
    outerfaceNode.portType = null;
    // todo see pos
    this.addBioxNodeOnPosition(outerfaceNode, 0, 0);
  }

  private addNode(node: WorkflowNode<any>): void {
    this.workflow.addNode(node);
  }


  //////////////////////// GETS ////////////////////////////


  public getCurrentLayerHierarchy(): Observable<WorkflowLayer[]> {
    return this.workflow.getCurrentLayerHierarchy();
  }

  public onConnectionSelected(): Observable<WorkflowConnection> {
    return this.workflow.onConnectionSelected();
  }

  public getMode(): WorkflowMode {
    return this.workflow.getMode();
  }

  public findNodeWithName(name: string): WorkflowNode<any> {
    return this.workflow.findNodeWithNameInCurrentLayer(name);
  }

  //////////////////////// INIT NODES AND CONNECTIONS FOR FLOW ////////////////////////////
  // create nodes and connection for a flow
  private initFlow(flow: BioxProtocol): void {
    // add all nodes
    this.addNodesRecursively(flow.data.getRootNodes(), 0, 0);

    // create the connections
    for (const step of flow.data.getAllConnections()) {
      this.addConnection(step);
    }
  }


  private addNodesRecursively(nodes: BioxNode[], posX: number, basePosY: number): number {
    let currentPosY: number = basePosY - 1;
    for (const node of nodes) {
      // check if the node has already been added
      if (this.workflow.findNodeWithNameInCurrentLayer(node.name) != null) {
        continue;
      }

      currentPosY++;

      // and the node and mark it as added
      this.addBioxNodeOnPosition(node, posX, currentPosY);

      for (const key of Object.keys(node.outputs)) {
        const outputNodes: BioxNode[] = node.outputs[key].map(output => output.getNode());
        currentPosY = this.addNodesRecursively(outputNodes, posX + 1, currentPosY);
      }
    }

    return currentPosY;
  }

  /**
   *
   * @param node
   * @param posX position in the workflow like in 2d array
   * @param posY position in the workflow like in 2d array
   */
  private addBioxNodeOnPosition(node: BioxNode, posX: number, posY: number): void {
    // convert the 2D position to coords
    const coordX = ((this.htmlNodeWidth + this.htmlDefaultNodeSpace) * posX) + this.htmlOffsetX;
    const coordY = ((this.htmlNodeHeight + this.htmlDefaultNodeSpace) * posY) + this.htmlOffsetY;

    let workflowNode: WorkflowNode<any>;
    if (node instanceof BioxProcessableBase) {
      workflowNode = new WorkflowNodeProcessable(node, node.name, coordX, coordY);
    } else if (node instanceof BioxInterfaceNode) {
      workflowNode = new WorkflowNodeInterface(node, coordX, coordY);
    } else if (node instanceof BioxOuterfaceNode) {
      workflowNode = new WorkflowNodeOuterface(node, coordX, coordY);
    } else {
      throw new Error('Node type unknown');
    }

    // and the node and mark it as added
    this.addNode(workflowNode);
  }

  /**
   * Convert a BioxConnection to a WorkflowConnection and add it to the current layer
   */
  private addConnection(connection: BioxConnection): void {
    const outputNode: WorkflowNode<any> = this.findNodeWithName(connection.from.getNodeName());
    const inputNode: WorkflowNode<any> = this.findNodeWithName(connection.to.getNodeName());

    const inputPort: WorkflowPort = inputNode.findInputPortByName(connection.to.getPort());
    const outputPort: WorkflowPort = outputNode.findOutputPortByName(connection.from.getPort());

    const workflowConnectionLink: WorkflowConnection = new WorkflowConnection(outputNode, inputNode,
      outputPort, inputPort, connection);
    this.workflow.addConnection(workflowConnectionLink);
  }

  //////////////////////// OTHER ////////////////////////////

  private generateId(prefix: string = ''): string {
    return prefix + this.idGenerator++;
  }

  public clear(): void {
    this.idGenerator = 0;
    this.experiment = null;
    this.workflow?.destroy();
    this.workflow = null;
  }


}

