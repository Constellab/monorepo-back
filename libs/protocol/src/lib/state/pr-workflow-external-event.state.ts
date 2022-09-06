import {Injectable} from '@angular/core';
import {
  FlPortalAction,
  FlPortalActionResult,
  FlPortalActionsService,
  FlSnackBarService,
  FlTranslatableText
} from '@monorepo/front-core-lib';
import {PrWorkflowConnection} from '../model/pr-workflow-connection.class';
import {PrWorkflowNode} from '../model/node/pr-workflow-node.class';
import {PrConfigEdit} from '../model/pr-config-edit.class';
import {Observable, Subscription} from 'rxjs';
import {PrAddProcessWithLink, PrNodeRelativeCoord} from '../model/pr-workflow-action.class';
import {PrWorkflow, PrWorkflowEvent} from '../model/pr-workflow.class';
import {PrWorkflowNodeInterface} from '../model/node/pr-workflow-node-interface.class';
import {PrWorkflowNodeOuterface} from '../model/node/pr-workflow-node-outerface.class';

export enum PrWorkflowAction {
  ADD_PROCESS = 'workflow-add-process',
  ADD_PROCESS_WITH_CONNECTIONS = 'workflow-add-process-with-connections',
  DELETE_PROCESS = 'workflow-remove-process',
  ADD_CONNECTION = 'workflow-add-connection',
  DELETE_CONNECTION = 'workflow-delete-connection',
  DELETE_INTERFACE = 'workflow-delete-interface',
  DELETE_OUTERFACE = 'workflow-delete-outerface',
}

export interface PrWorkflowEventConnectionAdditionalInfo {
  protocolId: string;
  connection: PrWorkflowConnection;
}

export interface PrWorkflowEventNodeAdditionalInfo {
  protocolId: string;
  node: PrWorkflowNode;
}

@Injectable()
export class PrWorkflowActionState2 {

  private config: PrConfigEdit;

  private workflow: PrWorkflow;

  private subscription: Subscription;

  constructor(private actionsService: FlPortalActionsService,
              private snackBarService: FlSnackBarService) {
  }


  public init(config: PrConfigEdit, workflow: PrWorkflow): void {
    this.config = config;
    this.workflow = workflow;
    this.subscription = this.workflow.getWorkflowEvent$().subscribe(
      event => this.onWorkflowEvent(event)
    );
  }

  public addNode(typingName: string, processName: string): void {
    const obs = this.config.saveProcess(this.workflow.currentLayer.id, typingName);

    this.addProcessAction(obs,
      {
        text: 'pr.adding_process', translateText: true,
        translateParam: {param: {processName: processName}}
      });
  }

  public addSource(resourceId: string, resourceName: string): void {
    const obs = this.config.saveSource(this.workflow.currentLayer.id, resourceId);

    this.addProcessAction(obs,
      {
        text: 'pr.adding_source', translateText: true,
        translateParam: {param: {resourceName: resourceName}}
      });
  }

  public addSourceToProcessInput(resourceId: string, processNodeName: string, inputPortName: string,
                                 resourceName: string): void {
    const obs = this.config.saveSourceToProcessInput(this.workflow.currentLayer.id, resourceId, processNodeName, inputPortName);
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
    const obs = this.config.saveTaskOutput(this.workflow.currentLayer.id, processNodeName, outputPortName);

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
    const obs = this.config.saveViewer(this.workflow.currentLayer.id, processNodeName, outputPortName);

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
    const processWithLink$ = this.config.saveProcessConnectedToOutput(this.workflow.currentLayer.id,
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
    const processWithLink$ = this.config.saveProcessConnectedToInput(this.workflow.currentLayer.id,
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
      type: PrWorkflowAction.ADD_PROCESS,
      // create the process in the API and get the process
      action: process$,
      additionalInformation: this.workflow.currentLayer.id
    };

    this.actionsService.addAction(action, true);
  }

  // create the action to add a process with a link
  private addProcessWithLinkAction(processWithLink$: Observable<PrAddProcessWithLink>,
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
      type: PrWorkflowAction.ADD_PROCESS_WITH_CONNECTIONS,
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

        if (node instanceof PrWorkflowNodeInterface) {
          portalAction = {
            type: PrWorkflowAction.DELETE_INTERFACE,
            text: {
              text: 'pr.deleting_interface',
              translateText: true,
              translateParam: {param: {name: node.getCurrentTitle()}}
            },
            action: this.config.deleteInterface(workflowEvent.protocolId, node.getCurrentTitle()),
          };
        } else if (node instanceof PrWorkflowNodeOuterface) {
          portalAction = {
            type: PrWorkflowAction.DELETE_OUTERFACE,
            text: {
              text: 'pr.deleting_outerface',
              translateText: true,
              translateParam: {param: {name: node.getCurrentTitle()}}
            },
            action: this.config.deleteOuterface(workflowEvent.protocolId, node.getCurrentTitle()),
          };
        } else {
          const additionalInfo: PrWorkflowEventNodeAdditionalInfo = {
            protocolId: workflowEvent.protocolId,
            node: workflowEvent.node
          };
          portalAction = {
            type: PrWorkflowAction.DELETE_PROCESS,
            text: {
              text: 'pr.deleting_process',
              translateText: true,
              translateParam: {param: {processName: node.getCurrentTitle()}}
            },
            action: this.config.onDeleteNode(workflowEvent.protocolId, workflowEvent.node),
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

        const additionalInformation: PrWorkflowEventConnectionAdditionalInfo = {
          protocolId: workflowEvent.protocolId,
          connection: workflowEvent.connection
        };

        if (workflowEvent.action === 'addConnection') {
          portalAction = {
            type: PrWorkflowAction.ADD_CONNECTION,
            text: {
              text: 'pr.adding_connection',
              translateText: true
            },
            action: this.config.onAddConnection(workflowEvent.protocolId, workflowEvent.connection),
            additionalInformation: additionalInformation
          };
        } else {
          portalAction = {
            type: PrWorkflowAction.DELETE_CONNECTION,
            text: {
              text: 'pr.deleting_connection',
              translateText: true
            },
            action: this.config.onDeleteConnection(workflowEvent.protocolId, workflowEvent.connection),
            additionalInformation: additionalInformation
          };
        }
        break;
    }

    this.actionsService.addAction(portalAction);
  }

  public getActions$(): Observable<FlPortalActionResult> {
    return this.actionsService.getResult$([
      PrWorkflowAction.ADD_PROCESS, PrWorkflowAction.ADD_PROCESS_WITH_CONNECTIONS,
      PrWorkflowAction.DELETE_PROCESS, PrWorkflowAction.DELETE_CONNECTION, PrWorkflowAction.ADD_CONNECTION]);
  }

  public clear(): void {
    this.subscription?.unsubscribe();
    this.workflow = null;
    this.config = null;
  }
}
