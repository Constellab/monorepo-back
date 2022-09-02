import {Injectable, NgZone} from '@angular/core';
import {LabWorkflow, LabWorkflowEvent} from '../model/lab-workflow.class';
import {LabWorkflowNodeProcess} from '../model/lab-workflow-node-process.class';
import {LabProcess} from '../../../../lab-core/model/entities/process/lab-process.entity';
import {
  LabConnection,
  LabFlow,
  LabFlowManager,
  LabInterfaceNode,
  LabNode,
  LabOuterfaceNode
} from '../../../../lab-core/model/global/lab-connection.class';
import {LabWorkflowLayer} from '../model/lab-workflow-layer.class';
import {BehaviorSubject, Observable, Subscription} from 'rxjs';
import {LabWorkflowConnection} from '../model/lab-workflow-connection.class';
import {LabExperiment} from '../../../../lab-core/model/entities/lab-experiment.entity';
import {LabProtocolService} from '../../../../lab-core/entity-service/lab-protocol.service';
import {LabWorkflowNode} from '../model/lab-workflow-node.class';
import {LabWorkflowNodeInterface} from '../model/lab-workflow-node-interface.class';
import {LabWorkflowNodeOuterface} from '../model/lab-workflow-node-outerface.class';
import {LabWorkflowPort} from '../model/lab-workflow-port.class';
import {LabProtocol} from '../../../../lab-core/model/entities/process/lab-protocol.entity';
import {
  FlCoord,
  FlPortalAction,
  FlPortalActionResult,
  FlPortalActionsService,
  FlSnackBarService,
  FlTranslatableText
} from '@monorepo/front-core-lib';
import {LabWorkflowNodeIO} from '../model/lab-workflow-node-io.class';
import {LabResourceService} from '../../../../lab-core/entity-service/lab-resource.service';
import {LabAddProcessWithLink, LabNodeRelativeCoord} from '../model/lab-workflow-action.class';
import {LabExperimentDetailPageState} from './lab-experiment-detail-page.state';
import {LabResource} from '../../../../lab-core/model/entities/resource/lab-resource.entity';

export enum LabWorkflowAction {
  ADD_PROCESS = 'workflow-add-process',
  ADD_PROCESS_WITH_CONNECTIONS = 'workflow-add-process-with-connections',
  DELETE_PROCESS = 'workflow-remove-process',
  ADD_CONNECTION = 'workflow-add-connection',
  DELETE_CONNECTION = 'workflow-delete-connection',
  DELETE_INTERFACE = 'workflow-delete-interface',
  DELETE_OUTERFACE = 'workflow-delete-outerface',
}

interface LabWorkflowEventConnectionAdditionalInfo {
  protocolId: string;
  connection: LabWorkflowConnection;
}

interface LabWorkflowEventNodeAdditionalInfo {
  protocolId: string;
  node: LabWorkflowNode<any>;
}

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
  private _layerIsLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private actionSubscription: Subscription;
  private flowsSubscription: Subscription;

  constructor(private protocolService: LabProtocolService,
              private actionsService: FlPortalActionsService,
              private resourceService: LabResourceService,
              private snackBarService: FlSnackBarService,
              private ngZone: NgZone) {
  }

  public init(element: HTMLElement, mainFlow: LabFlow<LabProtocol>, experimentState: LabExperimentDetailPageState): void {
    this.experimentState = experimentState;

    this.workflow = new LabWorkflow(element, 'Main protocol', mainFlow.object, 'edit', this.ngZone);

    this.workflow.getWorkflowEvent$().subscribe(
      (event: LabWorkflowEvent) => this.onWorkflowEvent(event)
    );
    this.workflow.start();

    // init the nodes with the job list
    this.initFlow(this.workflow.currentLayer, mainFlow);

    // listen to the new Process actions
    this.actionSubscription = this.actionsService.getResult$([
      LabWorkflowAction.ADD_PROCESS, LabWorkflowAction.ADD_PROCESS_WITH_CONNECTIONS,
      LabWorkflowAction.DELETE_PROCESS, LabWorkflowAction.DELETE_CONNECTION, LabWorkflowAction.ADD_CONNECTION]).subscribe(
      result => this.onWorkflowActionResult(result)
    );

    this.flowsSubscription = experimentState.getFlowUpdate$().subscribe(
      flow => this.refreshFlow(flow)
    );
  }


  //////////////////////// LAYER ////////////////////////////

  public selectLayer(layerId: string): void {
    if (this.workflow.hasLayer(layerId)) {
      this.workflow.selectLayer(layerId);
    } else {
      // if a layer is already loading, skip
      if (this._layerIsLoading$.value) return;
      // load a new layer
      this._layerIsLoading$.next(true);
      this.experimentState.getFlow(layerId).subscribe(
        {
          next: (flow) => {
            this._layerIsLoading$.next(false);
            if (!this.workflow.hasLayer(flow.object.id)) {
              this.addProtocolLayer(flow);
            }
          },
          error: () => this._layerIsLoading$.next(false)
        },
      );
    }
  }

  public get layerIsLoading$(): Observable<boolean> {
    return this._layerIsLoading$.asObservable();
  }


  private refreshFlow(flow: LabFlow<LabProtocol>): void {
    const layer = this.workflow.findLayerWithId(flow.object.id);
    if (layer) {
      layer.refreshObject(flow);
    }
  }

  /**
   * Create a new layer and init it with the protocol information
   */
  private addProtocolLayer(flow: LabFlow<LabProtocol>): void {
    const layer = this.workflow.createSubLayerIfNotExists(flow.object.name, flow.object.title, flow.object);
    this.initFlow(layer, flow);
  }

  //////////////////////// NODE ////////////////////////////

  public addProcessNode(processTypingName: string, processName: string): void {
    // retrieve the protocol of the layer
    const currentProtocol: LabProtocol = this.workflow.currentLayer.object as LabProtocol;

    this.addProcessAction(this.protocolService.addProcessToProtocol(currentProtocol.id, processTypingName),
      {
        text: 'biox.adding_process', translateText: true,
        translateParam: {param: {processName: processName}}
      });
  }

  public addSource(resourceId: string, resourceName: string): void {
    // retrieve the protocol of the layer
    const currentProtocol: LabProtocol = this.workflow.currentLayer.object as LabProtocol;

    this.addProcessAction(this.protocolService.addSource(currentProtocol.id, resourceId),
      {
        text: 'biox.adding_source', translateText: true,
        translateParam: {param: {resourceName: resourceName}}
      });
  }

  // create the action to add a process
  private addProcessAction(process$: Observable<LabProcess>, actionText: FlTranslatableText): void {
    // create an action to add this process
    const action: FlPortalAction = {
      text: actionText,
      type: LabWorkflowAction.ADD_PROCESS,
      // create the process in the API and get the process
      action: process$,
      additionalInformation: this.workflow.currentLayer.id
    };

    this.actionsService.addAction(action, true);
  }

  public addSourceToProcessInput(resourceId: string, processNodeName: string, inputPortName: string,
                                 resourceName: string): void {
    // retrieve the protocol of the layer
    const currentProtocol: LabProtocol = this.workflow.currentLayer.object as LabProtocol;

    this.addProcessWithLinkAction(
      this.protocolService.addSourceToProcessInput(currentProtocol.id, resourceId, processNodeName, inputPortName),
      processNodeName,
      'before',
      {
        text: 'biox.adding_source', translateText: true,
        translateParam: {param: {resourceName: resourceName}}
      });
  }

  public addTaskOutput(processNodeName: string, outputPortName: string): void {
    // retrieve the protocol of the layer
    const currentProtocol: LabProtocol = this.workflow.currentLayer.object as LabProtocol;

    this.addProcessWithLinkAction(
      this.protocolService.addTaskOutput(currentProtocol.id, processNodeName, outputPortName),
      processNodeName,
      'after',
      {
        text: 'biox.adding_output', translateText: true,
      });
  }

  public addViewerToOutput(processNodeName: string, outputPortName: string): void {
    // retrieve the protocol of the layer
    const currentProtocol: LabProtocol = this.workflow.currentLayer.object as LabProtocol;

    this.addProcessWithLinkAction(
      this.protocolService.addViewerToProcessOutput(currentProtocol.id, processNodeName, outputPortName),
      processNodeName,
      'after',
      {
        text: 'biox.adding_viewer', translateText: true,
      });
  }

  public addProcessConnectedToOutput(processTypingName: string, processName: string,
                                     outputProcessName: string, outputPortName: string): void {
    // retrieve the protocol of the layer
    const currentProtocol: LabProtocol = this.workflow.currentLayer.object as LabProtocol;

    this.addProcessWithLinkAction(
      this.protocolService.addProcessConnectedToOutput(currentProtocol.id, processTypingName,
        outputProcessName, outputPortName),
      outputProcessName,
      'after',
      {
        text: 'biox.adding_process', translateText: true,
        translateParam: {param: {processName: processName}}
      });
  }

  public addProcessConnectedToInput(processTypingName: string, processName: string,
                                    inputProcessName: string, inputPortName: string): void {
    // retrieve the protocol of the layer
    const currentProtocol: LabProtocol = this.workflow.currentLayer.object as LabProtocol;

    this.addProcessWithLinkAction(
      this.protocolService.addProcessConnectedToInput(currentProtocol.id, processTypingName,
        inputProcessName, inputPortName),
      inputProcessName,
      'after',
      {
        text: 'biox.adding_process', translateText: true,
        translateParam: {param: {processName: processName}}
      });
  }

  // create the action to add a process with a link
  private addProcessWithLinkAction(processWithLink$: Observable<LabAddProcessWithLink>,
                                   processNodeName: string,
                                   newProcessPosition: 'before' | 'after',
                                   actionText: FlTranslatableText): void {
    // relative coord to place the source node before the process
    const relativeCoord: LabNodeRelativeCoord = {
      nodeName: processNodeName,
      position: newProcessPosition,
      layerId: this.workflow.currentLayer.id
    };
    // create an action to add this process
    const action: FlPortalAction = {
      text: actionText,
      type: LabWorkflowAction.ADD_PROCESS_WITH_CONNECTIONS,
      // create the process in the API and get the process
      action: processWithLink$,
      additionalInformation: relativeCoord
    };

    this.actionsService.addAction(action, true);
  }


  private onNewProcess(process: LabProcess, layerId: string, coordX: number = 0, coordY: number = 0): void {
    // convert to node
    const node: LabWorkflowNode<any> = this.createNodeFromProcess(process, process.name, coordX, coordY);

    // add the node to the workflow
    const layer: LabWorkflowLayer = this.workflow.findLayerWithId(layerId);
    layer.addNode(node);
  }

  private onNewProcessWithConnector(processWithLink: LabAddProcessWithLink, relativeCoord: LabNodeRelativeCoord): void {
    const coord = this.getRelativeNodePosition(relativeCoord);
    this.onNewProcess(processWithLink.process, relativeCoord.layerId, coord.x, coord.y);

    const layer: LabWorkflowLayer = this.workflow.findLayerWithId(relativeCoord.layerId);
    this.addConnection(layer, processWithLink.link);
  }

  private createNodeFromProcess(process: LabProcess, name: string, coordX: number = 0, coordY: number = 0): LabWorkflowNode<any> {
    // create a specific node for the source
    const getResource = (id: string): Observable<LabResource> => this.resourceService.getById(id);
    if (process.isSource() || process.isOutput() || process.isViewer()) {
      return new LabWorkflowNodeIO(process, name, getResource, coordX, coordY);
    } else {
      return new LabWorkflowNodeProcess(process, name, coordX, coordY);
    }
  }

  //////////////////////// GETS ////////////////////////////


  public getCurrentLayerHierarchy(): Observable<LabWorkflowLayer[]> {
    return this.workflow.getCurrentLayerHierarchy();
  }

  public onConnectionSelected(): Observable<LabWorkflowConnection> {
    return this.workflow.onConnectionSelected();
  }

  public findNodeWithNameInCurrentLayer(name: string): LabWorkflowNode<any> {
    return this.workflow.findNodeWithNameInCurrentLayer(name);
  }

  public findNodeWithName(layerId: string, name: string): LabWorkflowNode<any> {
    const layer = this.workflow.findLayerWithId(layerId);

    if (layer == null) return null;
    return layer.findNodeWithName(name);
  }

  //////////////////////// INIT NODES AND CONNECTIONS FOR FLOW ////////////////////////////
  // create nodes and connection for a flow
  private initFlow(layer: LabWorkflowLayer, protocol: LabFlow<LabFlowManager>): void {
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
  private addNodesRecursively(layer: LabWorkflowLayer, nodes: LabNode[], posX: number, basePosY: number): number {
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
        const outputNodes: LabNode[] = node.outputConnections[key].map(output => output.getNode());
        currentPosY = this.addNodesRecursively(layer, outputNodes, posX + 1, currentPosY);
      }
    }

    // can't return an Y lower than the base Y
    return Math.max(currentPosY, basePosY);
  }

  /**
   *
   * @param layer
   * @param node
   * @param posX position in the workflow like in 2d array
   * @param posY position in the workflow like in 2d array
   */
  private addNodeOnPosition(layer: LabWorkflowLayer, node: LabNode, posX: number, posY: number): void {
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
    layer.addNode(workflowNode);
  }

  /**
   * Convert a Connection to a WorkflowConnection and add it to the current layer
   */
  private addConnection(layer: LabWorkflowLayer, connection: LabConnection): void {
    const outputNode: LabWorkflowNode<any> = this.findNodeWithNameInCurrentLayer(connection.from.getNodeName());
    const inputNode: LabWorkflowNode<any> = this.findNodeWithNameInCurrentLayer(connection.to.getNodeName());

    const inputPort: LabWorkflowPort = inputNode.findInputPortByName(connection.to.getPort());
    const outputPort: LabWorkflowPort = outputNode.findOutputPortByName(connection.from.getPort());

    const workflowConnectionLink: LabWorkflowConnection = new LabWorkflowConnection(outputNode, inputNode,
      outputPort, inputPort);
    layer.addConnection(workflowConnectionLink);
  }

  //////////////////////// OTHER ////////////////////////////

  private onWorkflowEvent(workflowEvent: LabWorkflowEvent): void {

    let portalAction: FlPortalAction;

    switch (workflowEvent.action) {
      case 'deleteNode':
        const process: LabProcess = workflowEvent.node.currentObject;

        if (process instanceof LabInterfaceNode) {
          portalAction = {
            type: LabWorkflowAction.DELETE_INTERFACE,
            text: {
              text: 'biox.deleting_interface',
              translateText: true,
              translateParam: {param: {name: process.portName}}
            },
            action: this.protocolService.deleteInterface(workflowEvent.protocolId, process.portName),
          };
        } else if (process instanceof LabOuterfaceNode) {
          portalAction = {
            type: LabWorkflowAction.DELETE_OUTERFACE,
            text: {
              text: 'biox.deleting_outerface',
              translateText: true,
              translateParam: {param: {name: process.portName}}
            },
            action: this.protocolService.deleteOuterface(workflowEvent.protocolId, process.portName),
          };
        } else {
          const additionalInfo: LabWorkflowEventNodeAdditionalInfo = {
            protocolId: workflowEvent.protocolId,
            node: workflowEvent.node
          };
          portalAction = {
            type: LabWorkflowAction.DELETE_PROCESS,
            text: {
              text: 'biox.deleting_process',
              translateText: true,
              translateParam: {param: {processName: process.name}}
            },
            action: this.protocolService.deleteProcessInProtocol(workflowEvent.protocolId, process.name),
            additionalInformation: additionalInfo
          };
        }
        break;
      case 'addConnection' :
      case 'deleteConnection' :
        const outputProcess = workflowEvent.connection.outputNode.currentObject;
        const inputProcess = workflowEvent.connection.inputNode.currentObject;

        if (outputProcess instanceof LabInterfaceNode ||
          inputProcess instanceof LabOuterfaceNode) {
          this.snackBarService.openErrorMessage({text: 'biox.delete_link_interface_error', translateText: true});
          // re-create the connection
          const layer = this.workflow.findLayerWithId(workflowEvent.protocolId);
          layer.addConnection(workflowEvent.connection);
          return;
        }

        const outputPort = workflowEvent.connection.outputPort.name;
        const inputPort = workflowEvent.connection.inputPort.name;


        const additionalInformation: LabWorkflowEventConnectionAdditionalInfo = {
          protocolId: workflowEvent.protocolId,
          connection: workflowEvent.connection
        };

        if (workflowEvent.action === 'addConnection') {
          portalAction = {
            type: LabWorkflowAction.ADD_CONNECTION,
            text: {
              text: 'biox.adding_connection',
              translateText: true
            },
            action: this.protocolService.addConnection(workflowEvent.protocolId, {
              output_process_name: outputProcess.name,
              input_process_name: inputProcess.name,
              output_port_name: outputPort,
              input_port_name: inputPort,
            }),
            additionalInformation: additionalInformation
          };
        } else {
          portalAction = {
            type: LabWorkflowAction.DELETE_CONNECTION,
            text: {
              text: 'biox.deleting_connection',
              translateText: true
            },
            action: this.protocolService.deleteConnection(workflowEvent.protocolId, inputProcess.name, inputPort),
            additionalInformation: additionalInformation
          };
        }
        break;
    }

    this.actionsService.addAction(portalAction);
  }

  private onWorkflowActionResult(actionResult: FlPortalActionResult): void {
    if (actionResult.status === 'success') {
      if (actionResult.action.type === LabWorkflowAction.ADD_PROCESS) {
        this.onNewProcess(actionResult.result, actionResult.additionalInformation);
      } else if (actionResult.action.type === LabWorkflowAction.ADD_PROCESS_WITH_CONNECTIONS) {
        this.onNewProcessWithConnector(actionResult.result, actionResult.additionalInformation);
      } else if (actionResult.action.type === LabWorkflowAction.DELETE_PROCESS) {
        // clear the node observable, if the deletion worked
        const info: LabWorkflowEventNodeAdditionalInfo = actionResult.additionalInformation;
        info.node.destroy();
      }
    } else {
      // revert the DELETE and ADD_CONNECTION actions
      if (actionResult.action.type === LabWorkflowAction.DELETE_CONNECTION) {
        const info: LabWorkflowEventConnectionAdditionalInfo = actionResult.additionalInformation;
        const layer = this.workflow.findLayerWithId(info.protocolId);
        layer.addConnection(info.connection);
      } else if (actionResult.action.type === LabWorkflowAction.ADD_CONNECTION) {
        const info: LabWorkflowEventConnectionAdditionalInfo = actionResult.additionalInformation;
        const layer = this.workflow.findLayerWithId(info.protocolId);
        layer.removeConnection(info.connection);
      } else if (actionResult.action.type === LabWorkflowAction.DELETE_PROCESS) {
        const info: LabWorkflowEventNodeAdditionalInfo = actionResult.additionalInformation;
        const layer = this.workflow.findLayerWithId(info.protocolId);
        layer.addNode(info.node);
      }
    }
  }

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
    this.flowsSubscription?.unsubscribe();
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

