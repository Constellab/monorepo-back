import {PrWorkflowConnection} from '../model/pr-workflow-connection.class';
import {PrWorkflowNode} from '../model/node/pr-workflow-node.class';
import {PrWorkflow, PrWorkflowMode} from '../model/pr-workflow.class';
import {Injectable, NgZone} from '@angular/core';
import {BehaviorSubject, Observable, Subscription} from 'rxjs';
import {FlCoord, FlPortalActionResult, FlSnackBarService} from '@monorepo/front-core-lib';
import {PrProtocolFlow} from '../model/pr-connection.class';
import {PrWorkflowLayer} from '../model/pr-workflow-layer.class';
import {PrAddProcessWithLink, PrNodeRelativeCoord} from '../model/pr-workflow-action.class';
import {PrWorkflowNodeProtocol} from '../model/node/pr-workflow-node-protocol.class';
import {
  PrWorkflowAction,
  PrWorkflowActionState2,
  PrWorkflowEventConnectionAdditionalInfo,
  PrWorkflowEventNodeAdditionalInfo
} from './pr-workflow-external-event.state';
import {PrConfigView} from '../model/pr-config-view.class';


/**
 * State for the workflow, it is created for the module and can only manage on state a the time
 */
@Injectable()
export class PrWorkflowManagerState {

  public workflow: PrWorkflow = null;
  public viewConfig: PrConfigView = null;

  private workflowElement: HTMLElement;

  private readonly htmlNodeWidth: number = 200;
  private readonly htmlNodeHeight: number = 100;
  private readonly htmlDefaultNodeSpaceX: number = 30;
  private readonly htmlDefaultNodeSpaceY: number = 10;
  private readonly htmlOffsetX: number = 10;
  private readonly htmlOffsetY: number = 10;

  private idGenerator: number = 0;
  private actionSubscription: Subscription;

  private mode$: Observable<PrWorkflowMode>;
  private currentMode: PrWorkflowMode;

  constructor(
    private actionState: PrWorkflowActionState2,
    private snackBarService: FlSnackBarService,
    private ngZone: NgZone) {
  }

  // emit to true when loading
  private _layerIsLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  public get layerIsLoading$(): Observable<boolean> {
    return this._layerIsLoading$.asObservable();
  }

  // unique function stored to override workflow event
  private stopEventFunction = (event: any): void => {
    event.stopImmediatePropagation();
  };

  //////////////////////// LAYER ////////////////////////////

  public init(element: HTMLElement, mainFlow: PrProtocolFlow,
              mode$: Observable<PrWorkflowMode>): PrWorkflow {
    this.workflowElement = element;
    this.mode$ = mode$;
    this.currentMode = 'edit';
    this.workflow = new PrWorkflow(element, 'Main protocol', mainFlow.id, this.currentMode, this.ngZone);

    this.workflow.start();

    // init the nodes with the job list
    this.initFlow(this.workflow.currentLayer, mainFlow);

    this.subscribeToMode();

    // listen to the new Process actions
    this.actionSubscription = this.actionState.getActions$().subscribe(
      result => this.onWorkflowActionResult(result)
    );

    return this.workflow;
  }

  public selectLayer(layerId: string, protocolNode?: PrWorkflowNodeProtocol): void {
    if (this.workflow.hasLayer(layerId)) {
      this.workflow.selectLayer(layerId);
    } else {
      // if a layer is already loading, skip
      if (this._layerIsLoading$.value) return;
      // load a new layer
      this._layerIsLoading$.next(true);
      if (protocolNode) {
        protocolNode.flow$.subscribe({
          next: flow => {
            this._layerIsLoading$.next(false);
            if (!this.workflow.hasLayer(flow.id)) {
              this.addProtocolLayer(flow);
              this._layerIsLoading$.next(false);
            }
          },
          error: () => this._layerIsLoading$.next(false)
        });
      }
    }
  }

  public findNodeWithNameInCurrentLayer(name: string): PrWorkflowNode {
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
  private addProtocolLayer(flow: PrProtocolFlow): void {
    const layer = this.workflow.createSubLayerIfNotExists(flow.name, flow.title, flow.id);
    this.initFlow(layer, flow);
  }

  private onNewNode(node: PrWorkflowNode, layerId: string, coordX: number = 0, coordY: number = 0): void {
    // Override the coords
    node.x = coordX;
    node.y = coordY;

    // add the node to the workflow
    const layer: PrWorkflowLayer = this.workflow.findLayerWithId(layerId);
    layer.addNode(node);
  }

  public getCurrentLayerHierarchy(): Observable<PrWorkflowLayer[]> {
    return this.workflow.getCurrentLayerHierarchy();
  }


  //////////////////////// INIT NODES AND CONNECTIONS FOR FLOW ////////////////////////////

  private onNewNodeWithConnector(processWithLink: PrAddProcessWithLink, relativeCoord: PrNodeRelativeCoord): void {
    const coord = this.getRelativeNodePosition(relativeCoord);
    this.onNewNode(processWithLink.process, relativeCoord.layerId, coord.x, coord.y);

    // add the connection
    const layer: PrWorkflowLayer = this.workflow.findLayerWithId(relativeCoord.layerId);
    layer.addPrConnection(processWithLink.connection);
  }

  // create nodes and connection for a flow
  private initFlow(layer: PrWorkflowLayer, protocol: PrProtocolFlow): void {
    // add all nodes
    this.addNodesRecursively(layer, protocol.getRootNodes(), protocol, 0, 0);

    // create the connections
    for (const connection of protocol.connections) {
      this.addConnection2(layer, connection);
    }
  }

  /**
   * Add the nodes if there have ot already been added and call method on output nodes
   */
  private addNodesRecursively(layer: PrWorkflowLayer, nodes: PrWorkflowNode[], flow: PrProtocolFlow, posX: number, basePosY: number): number {
    let currentPosY: number = basePosY - 1;
    for (const node of nodes) {
      // check if the node has already been added
      if (layer.findNodeWithName(node.nodeName) != null) {
        continue;
      }

      currentPosY++;

      // and the node and mark it as added
      this.addNodeOnPosition(layer, node, posX, currentPosY);

      const nextNodes = flow.getNextNodes(node.nodeName);
      currentPosY = this.addNodesRecursively(layer, nextNodes, flow, posX + 1, currentPosY);
    }

    // can't return an Y lower than the base Y
    return Math.max(currentPosY, basePosY);
  }

  //////////////////////// MODE ////////////////////////////

  /**
   * Subscribe to mode to disable or enable workflow events
   * @private
   */
  private subscribeToMode(): void {
    this.mode$.subscribe(mode => {
      this.currentMode = mode;
      if (mode === 'readOnly') {
        this.workflowElement.addEventListener('contextmenu', this.stopEventFunction, true);
        this.workflowElement.addEventListener('keydown', this.stopEventFunction, true);
      } else {
        this.workflowElement.removeEventListener('contextmenu', this.stopEventFunction, true);
        this.workflowElement.removeEventListener('keydown', this.stopEventFunction, true);
      }
    });
  }

  public getMode$(): Observable<PrWorkflowMode> {
    return this.mode$;
  }

  public getCurrentMode(): PrWorkflowMode {
    return this.currentMode;
  }


  //////////////////////// OTHER ////////////////////////////

  /**
   *
   * @param layer
   * @param node
   * @param posX position in the workflow like in 2d array
   * @param posY position in the workflow like in 2d array
   */
  private addNodeOnPosition(layer: PrWorkflowLayer, node: PrWorkflowNode, posX: number, posY: number): void {
    // convert the 2D position to coords
    // Override the coords
    node.x = ((this.htmlNodeWidth + this.htmlDefaultNodeSpaceX) * posX) + this.htmlOffsetX;
    node.y = ((this.htmlNodeHeight + this.htmlDefaultNodeSpaceY) * posY) + this.htmlOffsetY;
    // and the node and mark it as added
    layer.addNode(node);
  }

  /**
   * Convert a Connection to a WorkflowConnection and add it to the current layer
   */
  private addConnection2(layer: PrWorkflowLayer, connection: PrWorkflowConnection): void {
    layer.addConnection(connection);
  }


  private onWorkflowActionResult(actionResult: FlPortalActionResult): void {
    if (actionResult.status === 'success') {
      if (actionResult.action.type === PrWorkflowAction.ADD_PROCESS) {
        this.onNewNode(actionResult.result, actionResult.additionalInformation);
      } else if (actionResult.action.type === PrWorkflowAction.ADD_PROCESS_WITH_CONNECTIONS) {
        this.onNewNodeWithConnector(actionResult.result, actionResult.additionalInformation);
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

    const node: PrWorkflowNode = layer.findNodeWithName(relativeCoord.nodeName);
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

}

