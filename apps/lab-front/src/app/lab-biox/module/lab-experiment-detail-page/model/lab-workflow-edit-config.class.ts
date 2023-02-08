import {
  PrAddNodeWithConnection,
  PrNodeRelativeCoord,
  PrWorkflow,
  PrWorkflowConnection,
  PrWorkflowEvent,
  PrWorkflowLayer,
  PrWorkflowNode,
  PrWorkflowNodeInterface,
  PrWorkflowNodeOuterface,
  PrWorkflowNodeProcess
} from '@monorepo/protocol';
import {Observable, Subscription} from 'rxjs';
import {LabProtocolService} from '../../../../lab-core/entity-service/lab-protocol.service';
import {map} from 'rxjs/operators';
import {LabResourceService} from '../../../../lab-core/entity-service/lab-resource.service';
import {Injectable, OnDestroy} from '@angular/core';
import {
  FlPortalAction,
  FlPortalActionResult,
  FlPortalActionsService,
  FlSnackBarService,
  FlTranslatableText
} from '@monorepo/front-core-lib';
import {LabWorkflowFactory} from './lab-workflow.factory';

export enum LabWorkflowAction {
  ADD_PROCESS = 'workflow-add-process',
  ADD_PROCESS_WITH_CONNECTIONS = 'workflow-add-process-with-connections',
  DELETE_PROCESS = 'workflow-remove-process',
  ADD_CONNECTION = 'workflow-add-connection',
  DELETE_CONNECTION = 'workflow-delete-connection',
  DELETE_INTERFACE = 'workflow-delete-interface',
  DELETE_OUTERFACE = 'workflow-delete-outerface',
}

export interface LabWorkflowEventConnectionAdditionalInfo {
  protocolId: string;
  connection: PrWorkflowConnection;
}

export interface LabWorkflowEventNodeAdditionalInfo {
  protocolId: string;
  node: PrWorkflowNode;
  connections: PrWorkflowConnection[];
}


@Injectable()
export class LabWorkflowEditConfig implements OnDestroy {

  private workflow: PrWorkflow;

  private actionSubscription: Subscription;
  private workflowSubscription: Subscription;

  constructor(private protocolService: LabProtocolService,
              private resourceService: LabResourceService,
              private actionsService: FlPortalActionsService,
              private snackBarService: FlSnackBarService,
              private workflowFactory: LabWorkflowFactory) {

    // listen to the new Process actions
    this.actionSubscription = this.getActions$().subscribe(
      result => this.onWorkflowActionResult(result)
    );
  }

  public setWorkflow(workflow: PrWorkflow): void {
    this.workflow = workflow;
    workflow.getWorkflowEvent$().subscribe(
      event => this.onWorkflowEvent(event)
    );
  }

  public addNode(typingName: string, processName: string): void {
    const obs = this.saveProcess(this.workflow.currentLayer.id, typingName);

    this.addProcessAction(obs,
      {
        text: 'pr.adding_process', translateText: true,
        translateParam: {param: {processName: processName}}
      });
  }

  public addSource(resourceId: string, resourceName: string): void {
    const obs = this.saveSource(this.workflow.currentLayer.id, resourceId);

    this.addProcessAction(obs,
      {
        text: 'pr.adding_source', translateText: true,
        translateParam: {param: {resourceName: resourceName}}
      });
  }

  public addSourceToProcessInput(resourceId: string, processNodeName: string, inputPortName: string,
                                 resourceName: string): void {
    const obs = this.saveSourceToProcessInput(this.workflow.currentLayer.id, resourceId, processNodeName, inputPortName);
    this.addProcessWithLinkAction(
      obs,
      processNodeName,
      'before',
      {
        text: 'pr.adding_source', translateText: true,
        translateParam: {param: {resourceName: resourceName}}
      });
  }

  public addTaskOutput(processNodeName: string, outputPortName: string): void {
    const obs = this.saveTaskOutput(this.workflow.currentLayer.id, processNodeName, outputPortName);

    this.addProcessWithLinkAction(
      obs,
      processNodeName,
      'after',
      {
        text: 'pr.adding_output', translateText: true,
      });
  }

  public addViewerToOutput(processNodeName: string, outputPortName: string): void {
    // retrieve the protocol of the layer
    const obs = this.saveViewer(this.workflow.currentLayer.id, processNodeName, outputPortName);

    this.addProcessWithLinkAction(
      obs,
      processNodeName,
      'after',
      {
        text: 'pr.adding_viewer', translateText: true,
      });
  }

  public addProcessConnectedToOutput(processTypingName: string, processHumanName: string,
                                     outputProcessName: string, outputPortName: string): void {
    const processWithLink$ = this.saveProcessConnectedToOutput(this.workflow.currentLayer.id,
      processTypingName, outputProcessName, outputPortName);

    this.addProcessWithLinkAction(
      processWithLink$,
      outputProcessName,
      'after',
      {
        text: 'pr.adding_process', translateText: true,
        translateParam: {param: {processName: processHumanName}}
      });
  }

  public addProcessConnectedToInput(processTypingName: string, processHumanName: string,
                                    inputProcessName: string, inputPortName: string): void {
    const processWithLink$ = this.saveProcessConnectedToInput(this.workflow.currentLayer.id,
      processTypingName, inputProcessName, inputPortName);

    this.addProcessWithLinkAction(
      processWithLink$,
      inputProcessName,
      'before',
      {
        text: 'pr.adding_process', translateText: true,
        translateParam: {param: {processName: processHumanName}}
      });
  }

  // create the action to add a process
  private addProcessAction(process$: Observable<PrWorkflowNode>, actionText: FlTranslatableText): void {
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

  // create the action to add a process with a link
  private addProcessWithLinkAction(processWithLink$: Observable<PrAddNodeWithConnection>,
                                   processNodeName: string,
                                   newProcessPosition: 'before' | 'after',
                                   actionText: FlTranslatableText): void {
    // relative coord to place the source node before the process
    const relativeCoord: PrNodeRelativeCoord = {
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

  private onWorkflowEvent(workflowEvent: PrWorkflowEvent): void {

    let portalAction: FlPortalAction;

    switch (workflowEvent.action) {
      case 'deleteNode':
        const node: PrWorkflowNode = workflowEvent.node;
        const additionalInfo: LabWorkflowEventNodeAdditionalInfo = {
          protocolId: workflowEvent.protocolId,
          node: workflowEvent.node,
          connections: workflowEvent.connections
        };

        if (node instanceof PrWorkflowNodeInterface) {
          portalAction = {
            type: LabWorkflowAction.DELETE_INTERFACE,
            text: {
              text: 'pr.deleting_interface',
              translateText: true,
              translateParam: {param: {name: node.getCurrentTitle()}}
            },
            action: this.deleteInterface(workflowEvent.protocolId, node.getPort().name),
            additionalInformation: additionalInfo
          };
        } else if (node instanceof PrWorkflowNodeOuterface) {
          portalAction = {
            type: LabWorkflowAction.DELETE_OUTERFACE,
            text: {
              text: 'pr.deleting_outerface',
              translateText: true,
              translateParam: {param: {name: node.getCurrentTitle()}},
            },
            action: this.deleteOuterface(workflowEvent.protocolId, node.getPort().name),
            additionalInformation: additionalInfo
          };
        } else {
          portalAction = {
            type: LabWorkflowAction.DELETE_PROCESS,
            text: {
              text: 'pr.deleting_process',
              translateText: true,
              translateParam: {param: {processName: node.getCurrentTitle()}}
            },
            action: this.onDeleteNode(workflowEvent.protocolId, workflowEvent.node),
            additionalInformation: additionalInfo
          };
        }
        break;
      case 'addConnection' :
      case 'deleteConnection' :
        if (workflowEvent.connection.isIOFaceConnection()) {
          this.snackBarService.openErrorMessage({text: 'pr.delete_link_interface_error', translateText: true});
          // re-create the connection
          const layer = this.workflow.findLayerWithId(workflowEvent.protocolId);
          layer.addConnection(workflowEvent.connection);
          return;
        }

        const additionalInformation: LabWorkflowEventConnectionAdditionalInfo = {
          protocolId: workflowEvent.protocolId,
          connection: workflowEvent.connection
        };

        if (workflowEvent.action === 'addConnection') {
          portalAction = {
            type: LabWorkflowAction.ADD_CONNECTION,
            text: {
              text: 'pr.adding_connection',
              translateText: true
            },
            action: this.onAddConnection(workflowEvent.protocolId, workflowEvent.connection),
            additionalInformation: additionalInformation
          };
        } else {
          portalAction = {
            type: LabWorkflowAction.DELETE_CONNECTION,
            text: {
              text: 'pr.deleting_connection',
              translateText: true
            },
            action: this.onDeleteConnection(workflowEvent.protocolId, workflowEvent.connection),
            additionalInformation: additionalInformation
          };
        }
        break;
      case 'nodeMoved':
        this.saveNodePosition(workflowEvent.node, workflowEvent.protocolId);
        return;
    }

    this.actionsService.addAction(portalAction);
  }

  private saveNodePosition(node: PrWorkflowNode, protocolId: string): void {
    if (node instanceof PrWorkflowNodeProcess) {
      // save the node positions
      this.protocolService.saveProcessLayout(protocolId, node.nodeName,
        node.getCoords()).subscribe();
    } else if (node instanceof PrWorkflowNodeInterface) {
      this.protocolService.saveInterfaceLayout(protocolId, node.interfaceName,
        node.getCoords()).subscribe();
    } else if (node instanceof PrWorkflowNodeOuterface) {
      this.protocolService.saveOuterfaceLayout(protocolId, node.outerfaceName,
        node.getCoords()).subscribe();
    }
  }

  private onWorkflowActionResult(actionResult: FlPortalActionResult): void {
    if (actionResult.status === 'success') {
      if (actionResult.action.type === LabWorkflowAction.ADD_PROCESS) {
        this.onNewNode(actionResult.result, actionResult.additionalInformation);
      } else if (actionResult.action.type === LabWorkflowAction.ADD_PROCESS_WITH_CONNECTIONS) {
        this.onNewNodeWithConnector(actionResult.result, actionResult.additionalInformation);
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
      } else if ([LabWorkflowAction.DELETE_PROCESS, LabWorkflowAction.DELETE_INTERFACE, LabWorkflowAction.DELETE_OUTERFACE]
        .includes(actionResult.action.type as any)) {
        // re-create the node and connection
        const info: LabWorkflowEventNodeAdditionalInfo = actionResult.additionalInformation;

        // re-create the node
        this.onNewNode(info.node, info.protocolId);

        const layer: PrWorkflowLayer = this.workflow.findLayerWithId(info.protocolId);
        // re-create the connections
        for (const connection of info.connections) {
          layer.addConnection(connection);
        }
      }
    }
  }

  private onNewNode(node: PrWorkflowNode, layerId: string,): void {
    // add the node to the workflow
    const layer: PrWorkflowLayer = this.workflow.findLayerWithId(layerId);
    layer.addNode(node);

    // save the node positions after the creation
    this.saveNodePosition(node, layerId);
  }

  private onNewNodeWithConnector(processWithLink: PrAddNodeWithConnection, relativeCoord: PrNodeRelativeCoord): void {

    // add the node to the workflow
    const layer: PrWorkflowLayer = this.workflow.findLayerWithId(relativeCoord.layerId);

    // set the correct position for the new node
    const coord = layer.getRelativeNodePosition(relativeCoord.nodeName, relativeCoord.position);
    const node = processWithLink.node;
    node.setCoords(coord);

    this.onNewNode(processWithLink.node, relativeCoord.layerId);

    layer.addPrConnection(processWithLink.connection);
  }

  saveProcess(protocolId: string, typingName: string): Observable<PrWorkflowNode> {
    return this.protocolService.addProcessToProtocol(protocolId, typingName).pipe(
      map(process => this.workflowFactory.labProcessToWorkflowNode(process))
    );
  }

  saveSource(protocolId: string, resourceId: string): Observable<PrWorkflowNode> {
    return this.protocolService.addSource(protocolId, resourceId).pipe(
      map(process => this.workflowFactory.labProcessToWorkflowNode(process))
    );
  }


  saveSourceToProcessInput(protocolId: string, resourceId: string,
                           processNodeName: string, inputPortName: string): Observable<PrAddNodeWithConnection> {
    return this.protocolService.addSourceToProcessInput(protocolId, resourceId, processNodeName, inputPortName).pipe(
      map(processWithLink => this.workflowFactory.labProcessWithLinkToNodeWithLink(processWithLink))
    );
  }

  saveTaskOutput(protocolId: string, processNodeName: string, outputPortName: string): Observable<PrAddNodeWithConnection> {
    return this.protocolService.addTaskOutput(protocolId, processNodeName, outputPortName).pipe(
      map(processWithLink => this.workflowFactory.labProcessWithLinkToNodeWithLink(processWithLink))
    );
  }

  saveViewer(protocolId: string, processName: string, outputPortName: string): Observable<PrAddNodeWithConnection> {
    return this.protocolService.addViewerToProcessOutput(protocolId, processName, outputPortName).pipe(
      map(processWithLink => this.workflowFactory.labProcessWithLinkToNodeWithLink(processWithLink))
    );
  }


  saveProcessConnectedToOutput(protocolId: string, processTypingName: string, outputProcessName: string,
                               outputPortName: string): Observable<PrAddNodeWithConnection> {
    return this.protocolService.addProcessConnectedToOutput(protocolId, processTypingName, outputProcessName, outputPortName).pipe(
      map(processWithLink => this.workflowFactory.labProcessWithLinkToNodeWithLink(processWithLink))
    );
  }

  saveProcessConnectedToInput(protocolId: string, processTypingName: string,
                              inputProcessName: string, inputPortName: string): Observable<PrAddNodeWithConnection> {
    return this.protocolService.addProcessConnectedToInput(protocolId, processTypingName, inputProcessName, inputPortName).pipe(
      map(processWithLink => this.workflowFactory.labProcessWithLinkToNodeWithLink(processWithLink))
    );
  }

  deleteInterface(protocolId: string, portName: string): Observable<void> {
    return this.protocolService.deleteInterface(protocolId, portName);
  }

  deleteOuterface(protocolId: string, portName: string): Observable<void> {
    return this.protocolService.deleteOuterface(protocolId, portName);
  }

  onDeleteConnection(protocolId: string, connection: PrWorkflowConnection): Observable<void> {
    return this.protocolService.deleteConnection(protocolId, connection.inputNode.nodeName, connection.inputPort.name);
  }

  onAddConnection(protocolId: string, connection: PrWorkflowConnection): Observable<void> {
    return this.protocolService.addConnection(protocolId, {
      input_port_name: connection.inputPort.name,
      input_process_name: connection.inputNode.nodeName,
      output_port_name: connection.outputPort.name,
      output_process_name: connection.outputNode.nodeName
    });
  }

  onDeleteNode(protocolId: string, node: PrWorkflowNode): Observable<void> {
    return this.protocolService.deleteProcessInProtocol(protocolId, node.nodeName);
  }

  public getActions$(): Observable<FlPortalActionResult> {
    return this.actionsService.getResult$([
      LabWorkflowAction.ADD_PROCESS, LabWorkflowAction.ADD_PROCESS_WITH_CONNECTIONS,
      LabWorkflowAction.DELETE_PROCESS,
      LabWorkflowAction.DELETE_INTERFACE, LabWorkflowAction.DELETE_OUTERFACE,
      LabWorkflowAction.DELETE_CONNECTION, LabWorkflowAction.ADD_CONNECTION]);
  }

  ngOnDestroy(): void {
    this.workflowSubscription?.unsubscribe();
    this.actionSubscription?.unsubscribe();
  }


}
