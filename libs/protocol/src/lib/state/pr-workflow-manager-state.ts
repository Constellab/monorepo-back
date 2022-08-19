import {PrWorkflowConnection} from '../model/pr-workflow-connection.class';
import {PrWorkflowNode} from '../model/pr-workflow-node.class';
import {PrWorkflow, PrWorkflowEvent, PrWorkflowMode} from '../model/pr-workflow.class';
import {Injectable, NgZone} from '@angular/core';
import {BehaviorSubject, Observable, Subscription} from 'rxjs';
import {
  FlCoord,
  FlPortalAction,
  FlPortalActionResult,
  FlPortalActionsService,
  FlSnackBarService
} from '@monorepo/front-core-lib';
import {
  PrConnection,
  PrFlow,
  PrFlowManager,
  PrInterfaceNode,
  PrNode,
  PrOuterfaceNode
} from '../model/pr-connection.class';
import {PrProtocol} from '../model/pr-protocol.entity';
import {PrProcess} from '../model/pr-process.entity';
import {PrWorkflowLayer} from '../model/pr-workflow-layer.class';
import {PrWorkflowNodeProcess} from '../model/pr-workflow-node-process.class';
import {PrWorkflowNodeInterface} from '../model/pr-workflow-node-interface.class';
import {PrWorkflowNodeOuterface} from '../model/pr-workflow-node-outerface.class';
import {PrWorkflowPort} from '../model/pr-workflow-port.class';
import {PrAddProcessWithLink, PrNodeRelativeCoord} from '../model/pr-workflow-action.class';
import {PrWorkflowNodeIo} from '../model/pr-workflow-node-io.class';

export enum PrWorkflowAction {
  ADD_PROCESS = 'workflow-add-process',
  ADD_PROCESS_WITH_CONNECTIONS = 'workflow-add-process-with-connections',
  DELETE_PROCESS = 'workflow-remove-process',
  ADD_CONNECTION = 'workflow-add-connection',
  DELETE_CONNECTION = 'workflow-delete-connection',
  DELETE_INTERFACE = 'workflow-delete-interface',
  DELETE_OUTERFACE = 'workflow-delete-outerface',
}

interface PrWorkflowEventConnectionAdditionalInfo {
  protocolId: string;
  connection: PrWorkflowConnection;
}

interface PrWorkflowEventNodeAdditionalInfo {
  protocolId: string;
  node: PrWorkflowNode<any>;
}

/**
 * State for the workflow, it is created for the module and can only manage on state a the time
 */
@Injectable()
export class PrWorkflowManagerState {

  public workflow: PrWorkflow = null;

  private readonly htmlNodeWidth: number = 200;
  private readonly htmlNodeHeight: number = 100;
  private readonly htmlDefaultNodeSpaceX: number = 30;
  private readonly htmlDefaultNodeSpaceY: number = 10;
  private readonly htmlOffsetX: number = 10;
  private readonly htmlOffsetY: number = 10;

  private idGenerator: number = 0;
  private actionSubscription: Subscription;

  constructor(
    private actionsService: FlPortalActionsService,
    private snackBarService: FlSnackBarService,
    private ngZone: NgZone) {
  }

  // emit to true when loading
  private _layerIsLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  public get layerIsLoading$(): Observable<boolean> {
    return this._layerIsLoading$.asObservable();
  }


  //////////////////////// LAYER ////////////////////////////

  public init(element: HTMLElement, mainFlow: PrFlow<PrProtocol>,
              mode: PrWorkflowMode = 'edit'): void {
    this.workflow = new PrWorkflow(element, 'Main protocol', mainFlow.object, mode, this.ngZone);

    this.workflow.getWorkflowEvent$().subscribe(
      (event: PrWorkflowEvent) => this.onWorkflowEvent(event)
    );

    this.workflow.start();

    // init the nodes with the job list
    this.initFlow(this.workflow.currentLayer, mainFlow);


    // listen to the new Process actions
    this.actionSubscription = this.actionsService.getResult$([
      PrWorkflowAction.ADD_PROCESS, PrWorkflowAction.ADD_PROCESS_WITH_CONNECTIONS,
      PrWorkflowAction.DELETE_PROCESS, PrWorkflowAction.DELETE_CONNECTION, PrWorkflowAction.ADD_CONNECTION]).subscribe(
      result =>{
        this.onWorkflowActionResult(result);
      }
    );

  }

  public selectLayer(layerId: string, layerProtocol?: PrProtocol): void {
    if (this.workflow.hasLayer(layerId)) {
      this.workflow.selectLayer(layerId);
    } else {
      // if a layer is already loading, skip
      if (this._layerIsLoading$.value) return;
      // load a new layer
      this._layerIsLoading$.next(true);
      if(layerProtocol){
        const flow: PrFlow<PrProtocol> = new PrFlow<PrProtocol>(layerProtocol);
        if (!this.workflow.hasLayer(flow.object.id)) {
          this.addProtocolLayer(flow);
          this._layerIsLoading$.next(false);
        }
      }
    }
  }

  public findNodeWithNameInCurrentLayer(name: string): PrWorkflowNode<any> {
    return this.workflow.findNodeWithNameInCurrentLayer(name);
  }

  public clear(): void {
    this.idGenerator = 0;
    this.workflow?.destroy();
    this.workflow = null;
    this._layerIsLoading$.complete();
    this.actionSubscription?.unsubscribe();
  }

  //////////////////////// GETS ////////////////////////////

  /**
   * Create a new layer and init it with the protocol information
   */
  private addProtocolLayer(flow: PrFlow<PrProtocol>): void {
    const layer = this.workflow.createSubLayerIfNotExists(flow.object.name, flow.object.title, flow.object);
    this.initFlow(layer, flow);
  }

  private onNewProcess(process: PrProcess, layerId: string, coordX: number = 0, coordY: number = 0): void {
    // convert to node
    const node: PrWorkflowNode<any> = this.createNodeFromProcess(process, process.name, coordX, coordY);

    // add the node to the workflow
    const layer: PrWorkflowLayer = this.workflow.findLayerWithId(layerId);
    layer.addNode(node);
  }

  public getCurrentLayerHierarchy(): Observable<PrWorkflowLayer[]>{
    return this.workflow.getCurrentLayerHierarchy();
  }

  //////////////////////// INIT NODES AND CONNECTIONS FOR FLOW ////////////////////////////

  private onNewProcessWithConnector(processWithLink: PrAddProcessWithLink, relativeCoord: PrNodeRelativeCoord): void {
    const coord = this.getRelativeNodePosition(relativeCoord);
    this.onNewProcess(processWithLink.process, relativeCoord.layerId, coord.x, coord.y);

    const layer: PrWorkflowLayer = this.workflow.findLayerWithId(relativeCoord.layerId);
    this.addConnection(layer, processWithLink.link);
  }

  private createNodeFromProcess(process: PrProcess, name: string, coordX: number = 0, coordY: number = 0): PrWorkflowNode<any> {
    // create a specific node for the source
    if (process.isSource()) {
      return new PrWorkflowNodeIo(process, name, coordX, coordY);
    } else if (process.isOutput()) {
      return new PrWorkflowNodeIo(process, name, coordX, coordY);
    } else {
      return new PrWorkflowNodeProcess(process, name, coordX, coordY);
    }
  }

  // create nodes and connection for a flow
  private initFlow(layer: PrWorkflowLayer, protocol: PrFlow<PrFlowManager>): void {
    // add all nodes
    this.addNodesRecursively(layer, protocol.getRootNodes(), 0, 0);

    // create the connections
    for (const step of protocol.getAllConnections()) {

      this.addConnection(layer, step);
    }
  }

  /**
   * Add the nodes if there have ot already been added and call method on output nodes
   */
  private addNodesRecursively(layer: PrWorkflowLayer, nodes: PrNode[], posX: number, basePosY: number): number {
    let currentPosY: number = basePosY - 1;
    for (const node of nodes) {
      // check if the node has already been added
      if (layer.findNodeWithName(node.name) != null) {
        continue;
      }

      currentPosY++;

      // and the node and mark it as added
      this.addNodeOnPosition(layer, node, posX, currentPosY);

      for (const key of Object.keys(node.outputConnections)) {
        const outputNodes: PrNode[] = node.outputConnections[key].map(output => output.getNode());
        currentPosY = this.addNodesRecursively(layer, outputNodes, posX + 1, currentPosY);
      }
    }

    // can't return an Y lower than the base Y
    return Math.max(currentPosY, basePosY);
  }

  //////////////////////// OTHER ////////////////////////////

  /**
   *
   * @param layer
   * @param node
   * @param posX position in the workflow like in 2d array
   * @param posY position in the workflow like in 2d array
   */
  private addNodeOnPosition(layer: PrWorkflowLayer, node: PrNode, posX: number, posY: number): void {
    // convert the 2D position to coords
    const coordX = ((this.htmlNodeWidth + this.htmlDefaultNodeSpaceX) * posX) + this.htmlOffsetX;
    const coordY = ((this.htmlNodeHeight + this.htmlDefaultNodeSpaceY) * posY) + this.htmlOffsetY;

    let workflowNode: PrWorkflowNode<any>;
    if (node instanceof PrProcess) {
      workflowNode = this.createNodeFromProcess(node, node.name, coordX, coordY);
    } else if (node instanceof PrInterfaceNode) {
      workflowNode = new PrWorkflowNodeInterface(node, coordX, coordY);
    } else if (node instanceof PrOuterfaceNode) {
      workflowNode = new PrWorkflowNodeOuterface(node, coordX, coordY);
    } else {
      throw new Error('Node type unknown');
    }

    // and the node and mark it as added
    layer.addNode(workflowNode);
  }

  /**
   * Convert a Connection to a WorkflowConnection and add it to the current layer
   */
  private addConnection(layer: PrWorkflowLayer, connection: PrConnection): void {
    const outputNode: PrWorkflowNode<any> = this.findNodeWithNameInCurrentLayer(connection.from.getNodeName());
    const inputNode: PrWorkflowNode<any> = this.findNodeWithNameInCurrentLayer(connection.to.getNodeName());

    const inputPort: PrWorkflowPort = inputNode.findInputPortByName(connection.to.getPort());
    const outputPort: PrWorkflowPort = outputNode.findOutputPortByName(connection.from.getPort());
    const workflowConnectionLink: PrWorkflowConnection = new PrWorkflowConnection(outputNode, inputNode,
      outputPort, inputPort);
    layer.addConnection(workflowConnectionLink);
  }

  private onWorkflowActionResult(actionResult: FlPortalActionResult): void {
    if (actionResult.status === 'success') {
      if (actionResult.action.type === PrWorkflowAction.ADD_PROCESS) {
        this.onNewProcess(actionResult.result, actionResult.additionalInformation);
      } else if (actionResult.action.type === PrWorkflowAction.ADD_PROCESS_WITH_CONNECTIONS) {
        this.onNewProcessWithConnector(actionResult.result, actionResult.additionalInformation);
      } else if (actionResult.action.type === PrWorkflowAction.DELETE_PROCESS) {
        // clear the node observable, if the deletion worked
        const info: PrWorkflowEventNodeAdditionalInfo = actionResult.additionalInformation;
        info.node.destroy();
      }
    } else {
      // revert the DELETE and ADD_CONNECTION actions
      if (actionResult.action.type === PrWorkflowAction.DELETE_CONNECTION) {
        const info: PrWorkflowEventConnectionAdditionalInfo = actionResult.additionalInformation;
        const layer = this.workflow.findLayerWithId(info.protocolId);
        layer.addConnection(info.connection);
      } else if (actionResult.action.type === PrWorkflowAction.ADD_CONNECTION) {
        const info: PrWorkflowEventConnectionAdditionalInfo = actionResult.additionalInformation;
        const layer = this.workflow.findLayerWithId(info.protocolId);
        layer.removeConnection(info.connection);
      } else if (actionResult.action.type === PrWorkflowAction.DELETE_PROCESS) {
        const info: PrWorkflowEventNodeAdditionalInfo = actionResult.additionalInformation;
        const layer = this.workflow.findLayerWithId(info.protocolId);
        layer.addNode(info.node);
      }
    }
  }

  private generateId(prefix: string = ''): string {
    return prefix + this.idGenerator++;
  }

  /**
   * Return a relative node position based on another node
   * @param relativeCoord
   * @private
   */
  private getRelativeNodePosition(relativeCoord: PrNodeRelativeCoord): FlCoord {
    const layer = this.workflow.findLayerWithId(relativeCoord.layerId);
    if (layer == null) return {x: 0, y: 0};

    const node: PrWorkflowNode<any> = layer.findNodeWithName(relativeCoord.nodeName);
    if (node == null) return {x: 0, y: 0};

    // calculate the X pos based on relative node
    const baseNodeCoord = node.getCoords();

    let xCoord: number;
    if (relativeCoord.position === 'before') {
      xCoord = baseNodeCoord.x - (this.htmlNodeWidth + this.htmlDefaultNodeSpaceX);
    } else {
      xCoord = baseNodeCoord.x + (this.htmlNodeWidth + this.htmlDefaultNodeSpaceX);
    }
    return {
      x: xCoord,
      y: baseNodeCoord.y
    };
  }


  ///////////////////////////// OTHER ////////////////////////////////////
  private onWorkflowEvent(workflowEvent: PrWorkflowEvent): void {


    if(this.workflow.getMode() === 'edit'){
      let portalAction: FlPortalAction;

      this.actionsService.addAction(portalAction);
    }

  }


}

