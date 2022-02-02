import {Injectable, NgZone} from '@angular/core';
import {LabWorkflow, LabWorkflowMode} from '../model/lab-workflow.class';
import {LabWorkflowNodeProcess} from '../model/lab-workflow-node-process.class';
import {LabProcess} from '../../../../lab-core/model/entities/process/lab-process.entity';
import {
  LabConnection,
  LabFlow,
  LabInterfaceNode,
  LabNode,
  LabOuterfaceNode
} from '../../../../lab-core/model/global/lab-connection.class';
import {LabWorkflowLayer} from '../model/lab-workflow-layer.class';
import {BehaviorSubject, Observable, Subject, Subscription} from 'rxjs';
import {LabWorkflowConnection} from '../model/lab-workflow-connection.class';
import {LabExperiment} from '../../../../lab-core/model/entities/lab-experiment.entity';
import {LabProtocolService} from '../../../../lab-core/entity-service/lab-protocol.service';
import {LabWorkflowNode} from '../model/lab-workflow-node.class';
import {LabWorkflowNodeInterface} from '../model/lab-workflow-node-interface.class';
import {LabWorkflowNodeOuterface} from '../model/lab-workflow-node-outerface.class';
import {LabWorkflowPort} from '../model/lab-workflow-port.class';
import {LabProtocol} from '../../../../lab-core/model/entities/process/lab-protocol.entity';
import {FlCoord, FlPortalAction, FlPortalActionsService} from '@monorepo/front-core-lib';
import {LabWorkflowNodeIO} from '../model/lab-workflow-node-io.class';
import {LabResourceService} from '../../../../lab-core/entity-service/lab-resource.service';
import {filter} from 'rxjs/operators';
import {LabAddProcessWithLink, LabNodeRelativeCoord} from '../model/lab-workflow-action.class';
import {LabExperimentService} from '../../../../lab-core/entity-service/lab-experiment.service';
import {LabExperimentDetailPageState} from './lab-experiment-detail-page.state';
import {LabResource} from '../../../../lab-core/model/entities/resource/lab-resource.entity';

/**
 * State for the workflow, it is created for the module and can only manage on state a the time
 */
@Injectable()
export class LabWorkflowManagerState {

  public workflow: LabWorkflow = null;

  private readonly htmlNodeWidth: number = 200;
  private readonly htmlNodeHeight: number = 100;
  private readonly htmlDefaultNodeSpaceX: number = 30;
  private readonly htmlDefaultNodeSpaceY: number = 10;
  private readonly htmlOffsetX: number = 10;
  private readonly htmlOffsetY: number = 10;


  private experimentState: LabExperimentDetailPageState;

  private idGenerator: number = 0;

  // emit to true when loading
  private _layerIsLoading$: Subject<boolean> = new BehaviorSubject(false);
  private actionSubscription: Subscription;

  //  Name of the action to add a process for the ActionService
  private readonly addProcessAction: string = 'add-process';
  private readonly addProcessWithConnectorAction: string = 'add-process-with-connector';

  private refreshInterval: any;
  private refreshIntervalDuration: number = 2000;

  constructor(private protocolService: LabProtocolService,
              private experimentService: LabExperimentService,
              private actionsService: FlPortalActionsService,
              private resourceService: LabResourceService,
              private ngZone: NgZone) {
  }

  public init(element: HTMLElement, mainFlow: LabFlow<LabProtocol>, experimentState: LabExperimentDetailPageState): void {
    this.experimentState = experimentState;

    this.workflow = new LabWorkflow(element, experimentState.currentExperiment.title ?? 'Experiment', mainFlow.object, 'edit', this.ngZone);

    this.workflow.start();

    // init the nodes with the job list
    this.initFlow(mainFlow);

    // listen to the new Process actions
    this.actionSubscription = this.actionsService.getResult$([this.addProcessAction, this.addProcessWithConnectorAction])
      .pipe(filter(result => result.status === 'success')).subscribe(
        result => {
          switch (result.action.type) {
            case this.addProcessAction:
              this.onNewProcess(result.result, result.additionalInformation);
              return;
            case this.addProcessWithConnectorAction:
              this.onNewProcessWithConnector(result.result, result.additionalInformation);
              break;
          }
        }
      );

    experimentState.getFlowUpdate$().subscribe(
      flow => this.refreshFlow(flow)
    );
  }


  //////////////////////// LAYER ////////////////////////////

  public selectLayer(layerId: string): void {
    if (this.workflow.hasLayer(layerId)) {
      this.workflow.selectLayer(layerId);
    } else {
      this.loadNodeLayer(layerId);
    }
  }

  private loadNodeLayer(layerId: string): void {
    this._layerIsLoading$.next(true);
    this.experimentState.loadFlow(layerId);
  }


  public get layerIsLoading$(): Observable<boolean> {
    return this._layerIsLoading$.asObservable();
  }

  public startRefreshing(): void {
    this.clearInterval();
    // todo need to stop interval when protocol is finished
    this.experimentState.loadFlow(this.workflow.currentLayer.id);
    this.refreshInterval = setInterval(() => this.experimentState.loadFlow(this.workflow.currentLayer.id), this.refreshIntervalDuration);
  }


  private refreshFlow(flow: LabFlow<LabProtocol>): void {
    this._layerIsLoading$.next(false);

    const layer = this.workflow.findLayerWithId(flow.object.id);
    if (!layer) {
      this.addProtocolLayer(flow);
    } else {
      this.refreshLayerNodeObjects(layer, flow);
    }
  }

  /**
   * Create a new layer and init it with the protocol information
   */
  private addProtocolLayer(flow: LabFlow<LabProtocol>): void {
    this.workflow.createSubLayerIfNotExists(flow.object.name, flow.object.title, flow.object);
    this.initFlow(flow);
  }


  /**
   * Refresh the layer node objects with flow object
   */
  private refreshLayerNodeObjects(layer: LabWorkflowLayer, flow: LabFlow<LabProtocol>): void {
    // update the layer object
    layer.object = flow.object;
    for (const workflowNode of layer.nodes) {
      const node: LabNode = flow.getAllNodesArray().find(n => n.id === workflowNode.currentObject.id);

      if (node == null) continue;
      if (workflowNode instanceof LabWorkflowNodeProcess && node instanceof LabProcess) {
        workflowNode.updateObject(node);
      } else if (workflowNode instanceof LabWorkflowNodeInterface && node instanceof LabInterfaceNode) {
        workflowNode.updateObject(node);
      } else if (workflowNode instanceof LabWorkflowNodeOuterface && node instanceof LabOuterfaceNode) {
        workflowNode.updateObject(node);
      }
    }
  }


  //////////////////////// NODE ////////////////////////////

  public addProcessNode(processTypingName: string, processName: string): void {
    // retrieve the protocol of the layer
    const currentProtocol: LabProtocol = this.workflow.currentLayer.object as LabProtocol;

    // create an action to add this process
    const action: FlPortalAction = {
      text: {
        text: 'biox.adding_process', translateText: true,
        translateParam: {param: {processName: processName}}
      },
      type: this.addProcessAction,
      // create the process in the API and get the process
      action: this.protocolService.addProcessToProtocol(currentProtocol.id, processTypingName),
      additionalInformation: this.workflow.currentLayer.id
    };

    this.actionsService.addAction(action, true);
  }

  public addSourceToProcessInput(processNodeName: string, inputPortName: string, resourceId: string,
                                 resourceName: string): void {
    // retrieve the protocol of the layer
    const currentProtocol: LabProtocol = this.workflow.currentLayer.object as LabProtocol;

    // relative coord to place the source node before the process
    const relativeCoord: LabNodeRelativeCoord = {
      nodeName: processNodeName,
      position: 'before',
      layerId: this.workflow.currentLayer.id
    };
    // create an action to add this process
    const action: FlPortalAction = {
      text: {
        text: 'biox.adding_source', translateText: true,
        translateParam: {param: {resourceName: resourceName}}
      },
      type: this.addProcessWithConnectorAction,
      // create the process in the API and get the process
      action: this.protocolService.addSourceToProcessInput(currentProtocol.id, processNodeName, inputPortName, resourceId),
      additionalInformation: relativeCoord
    };

    this.actionsService.addAction(action, true);
  }

  public addTaskOutput(processNodeName: string, outputPortName: string): void {
    // retrieve the protocol of the layer
    const currentProtocol: LabProtocol = this.workflow.currentLayer.object as LabProtocol;

    // relative coord to place the source node before the process
    const relativeCoord: LabNodeRelativeCoord = {
      nodeName: processNodeName,
      position: 'after',
      layerId: this.workflow.currentLayer.id
    };
    // create an action to add this process
    const action: FlPortalAction = {
      text: {
        text: 'biox.adding_output', translateText: true,
      },
      type: this.addProcessWithConnectorAction,
      // create the process in the API and get the process
      action: this.protocolService.addTaskOutput(currentProtocol.id, processNodeName, outputPortName),
      additionalInformation: relativeCoord
    };

    this.actionsService.addAction(action, true);
  }

  private onNewProcess(process: LabProcess, layerId: string, coordX: number = 0, coordY: number = 0): void {
    // convert to node
    const node: LabWorkflowNode<any> = this.createNodeFromProcess(process, process.name, coordX, coordY);
    // add the node to the workflow

    this.workflow.addNodeToLayer(node, layerId);
  }

  private onNewProcessWithConnector(processWithLink: LabAddProcessWithLink, relativeCoord: LabNodeRelativeCoord): void {
    const coord = this.getRelativeNodePosition(relativeCoord);
    this.onNewProcess(processWithLink.process, relativeCoord.layerId, coord.x, coord.y);
    this.addConnection(processWithLink.link);
  }

  private createNodeFromProcess(process: LabProcess, name: string, coordX: number = 0, coordY: number = 0): LabWorkflowNode<any> {
    // create a specific node for the source
    const getResource = (id: string): Observable<LabResource> => this.resourceService.getById(id);
    if (process.isSource()) {
      return new LabWorkflowNodeIO(process, name, getResource, coordX, coordY);
    } else if (process.isOutput()) {
      return new LabWorkflowNodeIO(process, name, getResource, coordX, coordY);
    } else {
      return new LabWorkflowNodeProcess(process, name, coordX, coordY);
    }
  }

  public addInterface(): void {
    const interfaceNode: LabInterfaceNode = LabInterfaceNode.newGenericInterface(this.generateId('i_'));
    // todo see pos
    this.addNodeOnPosition(interfaceNode, 0, 0);
  }

  public addOuterface(): void {
    const outerfaceNode: LabOuterfaceNode = LabOuterfaceNode.newGenericInterface(this.generateId('o_'));
    // todo see pos
    this.addNodeOnPosition(outerfaceNode, 0, 0);
  }

  //////////////////////// GETS ////////////////////////////


  public getCurrentLayerHierarchy(): Observable<LabWorkflowLayer[]> {
    return this.workflow.getCurrentLayerHierarchy();
  }

  public onConnectionSelected(): Observable<LabWorkflowConnection> {
    return this.workflow.onConnectionSelected();
  }

  public getMode(): LabWorkflowMode {
    return this.workflow.getMode();
  }

  public findNodeWithName(name: string): LabWorkflowNode<any> {
    return this.workflow.findNodeWithNameInCurrentLayer(name);
  }

  //////////////////////// INIT NODES AND CONNECTIONS FOR FLOW ////////////////////////////
  // create nodes and connection for a flow
  private initFlow(protocol: LabFlow<LabProtocol>): void {
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
  private addNodesRecursively(nodes: LabNode[], posX: number, basePosY: number): number {
    let currentPosY: number = basePosY - 1;
    for (const node of nodes) {
      // check if the node has already been added
      if (this.workflow.findNodeWithNameInCurrentLayer(node.name) != null) {
        continue;
      }

      currentPosY++;

      // and the node and mark it as added
      this.addNodeOnPosition(node, posX, currentPosY);

      for (const key of Object.keys(node.outputConnections)) {
        const outputNodes: LabNode[] = node.outputConnections[key].map(output => output.getNode());
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
  private addNodeOnPosition(node: LabNode, posX: number, posY: number): void {
    // convert the 2D position to coords
    const coordX = ((this.htmlNodeWidth + this.htmlDefaultNodeSpaceX) * posX) + this.htmlOffsetX;
    const coordY = ((this.htmlNodeHeight + this.htmlDefaultNodeSpaceY) * posY) + this.htmlOffsetY;

    let workflowNode: LabWorkflowNode<any>;
    if (node instanceof LabProcess) {
      workflowNode = this.createNodeFromProcess(node, node.name, coordX, coordY);
    } else if (node instanceof LabInterfaceNode) {
      workflowNode = new LabWorkflowNodeInterface(node, coordX, coordY);
    } else if (node instanceof LabOuterfaceNode) {
      workflowNode = new LabWorkflowNodeOuterface(node, coordX, coordY);
    } else {
      throw new Error('Node type unknown');
    }

    // and the node and mark it as added
    this.workflow.addNodeToCurrentLayer(workflowNode);
  }

  /**
   * Convert a Connection to a WorkflowConnection and add it to the current layer
   */
  private addConnection(connection: LabConnection): void {
    const outputNode: LabWorkflowNode<any> = this.findNodeWithName(connection.from.getNodeName());
    const inputNode: LabWorkflowNode<any> = this.findNodeWithName(connection.to.getNodeName());

    const inputPort: LabWorkflowPort = inputNode.findInputPortByName(connection.to.getPort());
    const outputPort: LabWorkflowPort = outputNode.findOutputPortByName(connection.from.getPort());

    const workflowConnectionLink: LabWorkflowConnection = new LabWorkflowConnection(outputNode, inputNode,
      outputPort, inputPort, connection);
    this.workflow.addConnection(workflowConnectionLink);
  }


  //////////////////////// OTHER ////////////////////////////

  public getExperiment(): LabExperiment {
    return this.experimentState.currentExperiment;
  }

  private generateId(prefix: string = ''): string {
    return prefix + this.idGenerator++;
  }

  public clear(): void {
    this.idGenerator = 0;
    this.workflow?.destroy();
    this.workflow = null;
    this._layerIsLoading$.complete();
    this.actionSubscription?.unsubscribe();
    this.clearInterval();
  }

  private clearInterval(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  /**
   * Return a relative node position based on another node
   * @param relativeCoord
   * @private
   */
  private getRelativeNodePosition(relativeCoord: LabNodeRelativeCoord): FlCoord {
    const layer = this.workflow.findLayerWithId(relativeCoord.layerId);
    if (layer == null) return {x: 0, y: 0};

    const node: LabWorkflowNode<any> = layer.findNodeWithName(relativeCoord.nodeName);
    if (node == null) return {x: 0, y: 0};

    // calculate the X pos based on relative node
    const baseNodeCoord = node.getNodeCoord();

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

