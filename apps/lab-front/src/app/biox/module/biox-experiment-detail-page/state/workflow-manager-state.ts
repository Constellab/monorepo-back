import {Injectable, NgZone} from '@angular/core';
import {Workflow, WorkflowMode} from '../model/workflow.class';
import {WorkflowNodeProcess} from '../model/workflow-node-process.class';
import {BioxProcess} from '../../../../core/model/entities/process/biox-process.entity';
import {
  BioxConnection,
  BioxFlow,
  BioxInterfaceNode,
  BioxNode,
  BioxOuterfaceNode
} from '../../../../core/model/global/biox-connection.class';
import {WorkflowLayer} from '../model/workflow-layer.class';
import {BehaviorSubject, Observable, Subject, Subscription} from 'rxjs';
import {WorkflowConnection} from '../model/workflow-connection.class';
import {BioxExperiment} from '../../../../core/model/entities/biox-experiment.entity';
import {BioxProtocolService} from '../../../../core/entity-service/biox-protocol.service';
import {WorkflowNode} from '../model/workflow-node.class';
import {WorkflowNodeInterface} from '../model/workflow-node-interface.class';
import {WorkflowNodeOuterface} from '../model/workflow-node-outerface.class';
import {WorkflowPort} from '../model/workflow-port.class';
import {BioxProtocol} from '../../../../core/model/entities/process/biox-protocol.entity';
import {FlPortalAction, FlPortalActionResult, FlPortalActionsService} from '@monorepo/front-core-lib';

/**
 * State for the workflow, it is created for the module and can only manage on state a the time
 */
@Injectable()
export class WorkflowManagerState {

  public workflow: Workflow = null;

  private readonly htmlNodeWidth: number = 200;
  private readonly htmlNodeHeight: number = 100;
  private readonly htmlDefaultNodeSpaceX: number = 30;
  private readonly htmlDefaultNodeSpaceY: number = 10;
  private readonly htmlOffsetX: number = 10;
  private readonly htmlOffsetY: number = 10;


  private experiment: BioxExperiment = null;

  private idGenerator: number = 0;

  // emit to true when loading
  private _layerIsLoading$: Subject<boolean> = new BehaviorSubject(false);
  private subscription: Subscription;

  //  Name of the action to add a process for the ActionService
  private readonly addProcessActionName: string = 'add-process';

  constructor(private bioxProtocolService: BioxProtocolService,
              private actionsService: FlPortalActionsService,
              private ngZone: NgZone) {
    console.log('New workflow manager');
  }

  public init(element: HTMLElement, flow: BioxFlow<BioxProtocol>, experiment: BioxExperiment): void {
    this.experiment = experiment;

    this.workflow = new Workflow(element, experiment.data.title ?? 'Experiment', flow.object, 'edit', this.ngZone);

    this.workflow.start();

    // init the nodes with the job list
    this.initFlow(flow);

    // listen to the new Process actions
    this.subscription = this.actionsService.getResult$(this.addProcessActionName).subscribe(
      result => this.onNewProcess(result)
    );
  }


  //////////////////////// LAYER ////////////////////////////

  public selectLayer(nodeId: string): void {
    if (this.workflow.hasLayer(nodeId)) {
      this.workflow.selectLayer(nodeId);
    } else {
      this.loadNodeLayer(nodeId);
    }
  }

  private loadNodeLayer(nodeId: string): void {
    this._layerIsLoading$.next(true);
    const node: WorkflowNode<any> = this.workflow.findNodeWithId(nodeId);
    this.bioxProtocolService.getProtocolAsFlow(node.object.id).subscribe(
      protocol => this.onLoadLayerSuccess(protocol, nodeId),
      () => this._layerIsLoading$.next(false)
    );
  }

  private onLoadLayerSuccess(flow: BioxFlow<BioxProtocol>, nodeId: string): void {
    this._layerIsLoading$.next(false);
    this.addProtocolLayer(flow, nodeId);
  }

  /**
   * Create a new layer and init it with the protocol information
   */
  private addProtocolLayer(flow: BioxFlow<BioxProtocol>, nodeId: string): void {
    this.workflow.createSubLayerIfNotExists(nodeId, flow.object.name, flow.object.title, flow.object);
    this.initFlow(flow);
  }


  public get layerIsLoading$(): Observable<boolean> {
    return this._layerIsLoading$.asObservable();
  }

  //////////////////////// NODE ////////////////////////////

  public addProcessNode(processTypingName: string, processName: string): void {
    // retrieve the protocol of the layer
    const currentProtocol: BioxProtocol = this.workflow.currentLayer.object as BioxProtocol;

    // create an action to add this process
    const action: FlPortalAction = {
      text: {
        text: 'biox.adding_process', translateText: true,
        translateParam: {param: {processName: processName}}
      },
      type: this.addProcessActionName,
      // create the process in the API and get the process
      action: this.bioxProtocolService.addProcessToProtocol(currentProtocol.id, processTypingName),
    };

    this.actionsService.addAction(action, true);
  }

  private onNewProcess(actionResult: FlPortalActionResult<BioxProcess>): void {
    if (actionResult.status === 'error') return;

    // convert to node
    const node: WorkflowNodeProcess = this.createNodeFromProcess(actionResult.result);
    // add the node to the workflow
    this.addNode(node);
  }

  private createNodeFromProcess(process: BioxProcess): WorkflowNodeProcess {
    return new WorkflowNodeProcess(process, process.name, 0, 0);
  }

  public addInterface(): void {
    const interfaceNode: BioxInterfaceNode = BioxInterfaceNode.newGenericInterface(this.generateId('i_'));
    // todo see pos
    this.addBioxNodeOnPosition(interfaceNode, 0, 0);
  }

  public addOuterface(): void {
    const outerfaceNode: BioxOuterfaceNode = BioxOuterfaceNode.newGenericInterface(this.generateId('o_'));
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
  private initFlow(protocol: BioxFlow<BioxProtocol>): void {
    // disable check on workflow to force creation
    this.workflow.disableCheck();
    // add all nodes
    this.addNodesRecursively(protocol.getRootNodes(), 0, 0);

    // create the connections
    for (const step of protocol.getAllConnections()) {
      this.addConnection(step);
    }

    // re-enable check after init
    this.workflow.enableCheck();
  }


  /**
   * Add the nodes if there have ot already been added and call method on output nodes
   */
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

      for (const key of Object.keys(node.outputConnections)) {
        const outputNodes: BioxNode[] = node.outputConnections[key].map(output => output.getBioxNode());
        currentPosY = this.addNodesRecursively(outputNodes, posX + 1, currentPosY);
      }
    }

    // can't return an Y lower than the base Y
    return Math.max(currentPosY, basePosY);
  }

  /**
   *
   * @param node
   * @param posX position in the workflow like in 2d array
   * @param posY position in the workflow like in 2d array
   */
  private addBioxNodeOnPosition(node: BioxNode, posX: number, posY: number): void {
    // convert the 2D position to coords
    const coordX = ((this.htmlNodeWidth + this.htmlDefaultNodeSpaceX) * posX) + this.htmlOffsetX;
    const coordY = ((this.htmlNodeHeight + this.htmlDefaultNodeSpaceY) * posY) + this.htmlOffsetY;

    let workflowNode: WorkflowNode<any>;
    if (node instanceof BioxProcess) {
      workflowNode = new WorkflowNodeProcess(node as BioxProcess, node.name, coordX, coordY);
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

  public getExperiment(): BioxExperiment {
    return this.experiment;
  }

  private generateId(prefix: string = ''): string {
    return prefix + this.idGenerator++;
  }

  public clear(): void {
    this.idGenerator = 0;
    this.experiment = null;
    this.workflow?.destroy();
    this.workflow = null;
    this._layerIsLoading$.complete();
    this.subscription?.unsubscribe();
  }

}

