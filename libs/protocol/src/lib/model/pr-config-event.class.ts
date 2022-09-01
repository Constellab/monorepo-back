import {Observable} from 'rxjs';
import {PrProcess} from './pr-process.entity';
import {PrWorkflowManagerState} from '../state/pr-workflow-manager-state';
import {PrWorkflowEvent} from './pr-workflow.class';
import {PrWorkflowConnection} from './pr-workflow-connection.class';
import {PrWorkflowNode} from './pr-workflow-node.class';
import {PrAddProcessWithLink} from './pr-workflow-action.class';

export abstract class PrConfigEdit {

  private workflowManagerState: PrWorkflowManagerState;

  setState(workflowManagerState: PrWorkflowManagerState): void {
    this.workflowManagerState = workflowManagerState;
    this.workflowManagerState.workflow?.getWorkflowEvent$().subscribe((event) => {
      this.onWorkflowEvent(event);
    });
  }

  addProcessToCurrentProtocol(typingName: string, processName: string): void {
    const process$ = this.saveProcess(typingName, this.workflowManagerState.workflow.currentLayer.id);
    this.workflowManagerState.addProcessNode(process$, processName);
  }

  addSourceToCurrentProtocol(resourceId: string, resourceName: string): void {
    const source$ = this.saveSource(resourceId, this.workflowManagerState.workflow.currentLayer.id);
    this.workflowManagerState.addSource(source$, resourceName);
  }

  addSourceToProcessInput(resourceId: string, processNodeName: string, inputPortName: string,
                          resourceName: string): void {
    const processWithLink$ = this.saveSourceToProcessInput(resourceId, processNodeName, inputPortName, resourceName);
    this.workflowManagerState.addSourceToProcessInput(processWithLink$, processNodeName, resourceName);
  }

  addTaskOutput(processNodeName: string, outputPortName: string): void {
    const processWithLink$ = this.saveTaskOutput(processNodeName, outputPortName);
    this.workflowManagerState.addTaskOutput(processWithLink$, processNodeName);
  }

  addProcessConnectedToOutput(processTypingName: string, processName: string,
                              outputProcessName: string, outputPortName: string): void {
    const processWithLink$ = this.saveProcessConnectedToOutput(processTypingName, processName, outputProcessName, outputPortName);
    this.workflowManagerState.addProcessConnectedToOutput(processWithLink$, processName, outputProcessName);
  }

  addProcessConnectedToInput(processTypingName: string, processName: string,
                             inputProcessName: string, inputPortName: string): void {
    const processWithLink$ = this.saveProcessConnectedToInput(processTypingName, processName, inputProcessName, inputPortName);
    this.workflowManagerState.addProcessConnectedToInput(processWithLink$, processName, inputProcessName);
  }

  abstract saveProcess(typingName: string, protocolId: string): Observable<PrProcess>;

  abstract saveSource(resourceId: string, protocolId: string): Observable<PrProcess>;

  abstract saveSourceToProcessInput(resourceId: string, processNodeName: string, inputPortName: string,
                                    resourceName: string): Observable<PrAddProcessWithLink>;

  abstract saveTaskOutput(processNodeName: string, outputPortName: string): Observable<PrAddProcessWithLink>;

  abstract saveProcessConnectedToOutput(processTypingName: string, processName: string,
                                        outputProcessName: string, outputPortName: string): Observable<PrAddProcessWithLink>;

  abstract saveProcessConnectedToInput(processTypingName: string, processName: string,
                                       inputProcessName: string, inputPortName: string): Observable<PrAddProcessWithLink>;


  //OUTPUT EVENTS
  abstract onDeleteConnection(connection: PrWorkflowConnection, protocolId: string): void;

  abstract onAddConnection(connection: PrWorkflowConnection, protocolId: string): void;

  abstract onDeleteNode(node: PrWorkflowNode<any>, protocolId: string): void;

  private onWorkflowEvent(event: PrWorkflowEvent): void {
    switch (event.action) {
      case "deleteConnection":
        this.onDeleteConnection(event.connection, event.protocolId);
        break;
      case "addConnection":
        this.onAddConnection(event.connection, event.protocolId);
        break;
      case "deleteNode":
        this.onDeleteNode(event.node, event.protocolId);
        break;
    }
  }
}
