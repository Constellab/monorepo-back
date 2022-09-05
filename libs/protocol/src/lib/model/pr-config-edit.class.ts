import {Observable} from 'rxjs';
import {PrProcess} from './pr-process.entity';
import {PrWorkflowManagerState} from '../state/pr-workflow-manager-state';
import {PrWorkflowEvent, PrWorkflowMode} from './pr-workflow.class';
import {PrWorkflowConnection} from './pr-workflow-connection.class';
import {PrWorkflowNode} from './pr-workflow-node.class';
import {PrAddProcessWithLink} from './pr-workflow-action.class';
import {FlMenuDynamic, FlMenuDynamicButton, FlTranslatableText} from '@monorepo/front-core-lib';
import {PrWorkflowPort} from './pr-workflow-port.class';
import {PrWorkflowNodeProcess} from './pr-workflow-node-process.class';
import {PrWorkflowActionState} from '../state/pr-workflow-action-state';
import {PrWorkflowActionEvent} from './pr-workflow-drawer-event.class';

export class PrMenuDynamicButton {
  text: FlTranslatableText;
  icon?: string;
  onClick?: (event: MouseEvent) => void;
  divider?: boolean; // if true, it adds a divider before the button
  disabled?: () => boolean;
}


export abstract class PrConfigEdit {

  private workflowManagerState: PrWorkflowManagerState;
  private actionState: PrWorkflowActionState;

  getWorkflowMode(): PrWorkflowMode{
    return this.workflowManagerState.workflow.getMode();
  }

  setState(workflowManagerState: PrWorkflowManagerState, actionState: PrWorkflowActionState): void {
    this.workflowManagerState = workflowManagerState;
    this.actionState = actionState;
    this.workflowManagerState.workflow?.getWorkflowEvent$().subscribe((event) => {
      this.onWorkflowEvent(event);
    });
    this.actionState.getAction$().subscribe(action => {
      this.onAction(action);
    })
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


  // Node input & output dynamic menu
  abstract setInputMenu(port: PrWorkflowPort, node: PrWorkflowNodeProcess): PrMenuDynamicButton[];

  abstract setOutputMenu(port: PrWorkflowPort, node: PrWorkflowNodeProcess): PrMenuDynamicButton[];

  private prMenuToFlMenu(m: PrMenuDynamicButton, port: PrWorkflowPort, node: PrWorkflowNodeProcess): FlMenuDynamicButton{
    const menu: FlMenuDynamicButton = new FlMenuDynamicButton();
    menu.type = 'button';
    menu.icon = m.icon;
    menu.text = m.text;
    menu.divider = m.divider;
    menu.disabled = m.disabled();
    return menu;
  }

  public getInputMenu(port: PrWorkflowPort, node: PrWorkflowNodeProcess): FlMenuDynamic[]{
    return this.setInputMenu(port, node).map(m => this.prMenuToFlMenu(m, port, node));
  }

  public getOutputMenu(port: PrWorkflowPort, node: PrWorkflowNodeProcess): FlMenuDynamic[]{
    return this.setOutputMenu(port, node).map(m => this.prMenuToFlMenu(m, port, node));
  }

  // ACTION
  abstract onSelectNodeInfo(processNode: PrWorkflowNodeProcess, title: string): void;

  private onAction(action: PrWorkflowActionEvent): void{
    if(action == null) return;

    switch (action.action){
      case "selectNode":
        this.onSelectNodeInfo(action.processNode, action.title)
        break;
      default:
        return;
    }
  }
}
