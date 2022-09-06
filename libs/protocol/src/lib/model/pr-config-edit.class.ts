import {Observable} from 'rxjs';
import {PrWorkflowConnection} from './pr-workflow-connection.class';
import {PrWorkflowNode} from './node/pr-workflow-node.class';
import {PrAddProcessWithLink} from './pr-workflow-action.class';

export abstract class PrConfigEdit {


  abstract saveProcess(protocolId: string, typingName: string): Observable<PrWorkflowNode>;

  abstract saveSource(protocolId: string, resourceId: string): Observable<PrWorkflowNode>;


  abstract saveSourceToProcessInput(protocolId: string, resourceId: string,
                                    processNodeName: string, inputPortName: string): Observable<PrAddProcessWithLink>;

  abstract saveTaskOutput(protocolId: string, processNodeName: string, outputPortName: string): Observable<PrAddProcessWithLink>;

  abstract saveViewer(protocolId: string, processName: string,
                      outputPortName: string): Observable<PrAddProcessWithLink>;

  abstract saveProcessConnectedToOutput(protocolId: string, processTypingName: string,
                                        outputProcessName: string, outputPortName: string): Observable<PrAddProcessWithLink>;

  abstract saveProcessConnectedToInput(protocolId: string, processTypingName: string,
                                       inputProcessName: string, inputPortName: string): Observable<PrAddProcessWithLink>;

  //OUTPUT EVENTS
  abstract deleteInterface(protocolId: string, portName: string): Observable<void>;

  abstract deleteOuterface(protocolId: string, portName: string): Observable<void>;

  abstract onDeleteConnection(protocolId: string, connection: PrWorkflowConnection): Observable<void>;

  abstract onAddConnection(protocolId: string, connection: PrWorkflowConnection): Observable<void>;

  abstract onDeleteNode(protocolId: string, node: PrWorkflowNode): Observable<void>;
}
