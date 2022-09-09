import {
  PrAddProcessWithLink,
  PrConfigEdit,
  PrConfigSpecs,
  PrProcess,
  PrProtocolFlow,
  PrWorkflowConnection,
  PrWorkflowNode,
  PrWorkflowNodeOutput,
  PrWorkflowNodeProcess,
  PrWorkflowNodeProtocol,
  PrWorkflowNodeSource,
  PrWorkflowNodeViewer
} from '@monorepo/protocol';
import {Observable} from 'rxjs';
import {LabProtocolService} from '../../../../lab-core/entity-service/lab-protocol.service';
import {LabProcess} from '../../../../lab-core/model/entities/process/lab-process.entity';
import {map} from 'rxjs/operators';
import {LabAddProcessWithLink} from './lab-workflow-action.class';
import {LabResource} from '../../../../lab-core/model/entities/resource/lab-resource.entity';
import {LabResourceService} from '../../../../lab-core/entity-service/lab-resource.service';
import {LabProtocol} from '../../../../lab-core/model/entities/process/lab-protocol.entity';


export class LabWorkflowEditConfig extends PrConfigEdit {

  constructor(private protocolService: LabProtocolService,
              private resourceService: LabResourceService) {
    super();
  }

  saveProcess(protocolId: string, typingName: string): Observable<PrWorkflowNode> {
    return this.protocolService.addProcessToProtocol(protocolId, typingName).pipe(
      map(process => this.labProcessToWorkflowNode(process))
    );
  }

  saveSource(protocolId: string, resourceId: string): Observable<PrWorkflowNode> {
    return this.protocolService.addSource(protocolId, resourceId).pipe(
      map(process => this.labProcessToWorkflowNode(process))
    );
  }


  saveSourceToProcessInput(protocolId: string, resourceId: string,
                           processNodeName: string, inputPortName: string): Observable<PrAddProcessWithLink> {
    return this.protocolService.addSourceToProcessInput(protocolId, resourceId, processNodeName, inputPortName).pipe(
      map(processWithLink => this.labProcessWithLinkToNodeWithLink(processWithLink))
    );
  }

  saveTaskOutput(protocolId: string, processNodeName: string, outputPortName: string): Observable<PrAddProcessWithLink> {
    return this.protocolService.addTaskOutput(protocolId, processNodeName, outputPortName).pipe(
      map(processWithLink => this.labProcessWithLinkToNodeWithLink(processWithLink))
    );
  }

  saveViewer(protocolId: string, processName: string, outputPortName: string): Observable<PrAddProcessWithLink> {
    return this.protocolService.addViewerToProcessOutput(protocolId, processName, outputPortName).pipe(
      map(processWithLink => this.labProcessWithLinkToNodeWithLink(processWithLink))
    );
  }


  saveProcessConnectedToOutput(protocolId: string, processTypingName: string, outputProcessName: string,
                               outputPortName: string): Observable<PrAddProcessWithLink> {
    return this.protocolService.addProcessConnectedToOutput(protocolId, processTypingName, outputProcessName, outputPortName).pipe(
      map(processWithLink => this.labProcessWithLinkToNodeWithLink(processWithLink))
    );
  }

  saveProcessConnectedToInput(protocolId: string, processTypingName: string,
                              inputProcessName: string, inputPortName: string): Observable<PrAddProcessWithLink> {
    return this.protocolService.addProcessConnectedToInput(protocolId, processTypingName, inputProcessName, inputPortName).pipe(
      map(processWithLink => this.labProcessWithLinkToNodeWithLink(processWithLink))
    );
  }

  //OUTPUT EVENTS
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


  public protocolToFlow(protocol: LabProtocol): PrProtocolFlow {
    const flow: PrProtocolFlow = new PrProtocolFlow(protocol.id, protocol.name, protocol.title);

    for (const key in protocol.data.graph.nodes) {
      const process: LabProcess = protocol.data.graph.nodes[key];
      const node: PrWorkflowNodeProcess = this.labProcessToWorkflowNode(process);
      flow.addNode(node);
    }

    for (const link of protocol.data.graph.links) {
      flow.addConnection(link.from.nodeName, link.to.nodeName, link.from.port, link.to.port);
    }

    for (const inter of Object.values(protocol.data.graph.interfaces)) {
      flow.addInterface(inter.name, inter.to.nodeName, inter.to.port);
    }
    for (const outer of Object.values(protocol.data.graph.outerfaces)) {
      flow.addOuterface(outer.name, outer.from.nodeName, outer.from.port);
    }

    return flow;
  }

  private labProcessWithLinkToNodeWithLink(processWithLink: LabAddProcessWithLink): PrAddProcessWithLink {
    const node = this.labProcessToWorkflowNode(processWithLink.process);

    return {
      process: node,
      connection: {
        fromNode: processWithLink.link.from.nodeName,
        fromPort: processWithLink.link.from.port,
        toNode: processWithLink.link.to.nodeName,
        toPort: processWithLink.link.to.port
      }
    };
  }


  private labProcessToWorkflowNode(process: LabProcess): PrWorkflowNodeProcess {
    const prProcess = this.labProcessToPrProcess(process);

    const getResource = (id: string): Observable<LabResource> => this.resourceService.getById(id);
    if (process.isSource()) {
      return new PrWorkflowNodeSource(prProcess, getResource, 0, 0, process);
    } else if (process.isOutput()) {
      return new PrWorkflowNodeOutput(prProcess, getResource, 0, 0, process);
    } else if (process.isViewer()) {
      return new PrWorkflowNodeViewer(prProcess, getResource, 0, 0, process);
    } else if (process.isProtocol) {
      const flow$: Observable<PrProtocolFlow> = this.protocolService.getProtocol(process.id).pipe(
        map(protocol => this.protocolToFlow(protocol))
      );
      return new PrWorkflowNodeProtocol(prProcess, flow$, 0, 0, process);
    } else {
      return new PrWorkflowNodeProcess(prProcess, 0, 0, process);
    }
  }

  public labProcessToPrProcess(process: LabProcess): PrProcess {
    return {
      id: process.id,
      humanName: process.data.title,
      name: process.name,
      processTypingName: process.processTypingName,
      inputs: process.inputs,
      outputs: process.outputs,
      config: {
        specs: new PrConfigSpecs(process.config.data.specs.record),
        values: process.config.data.values,
      },
      status: process.status,
      parentProtocolId: process.parentProtocolId
    };
  }

}
