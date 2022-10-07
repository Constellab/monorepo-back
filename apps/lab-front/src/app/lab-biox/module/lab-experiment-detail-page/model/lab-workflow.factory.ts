import {LabProcessLayout, LabProtocol} from '../../../../lab-core/model/entities/process/lab-protocol.entity';
import {
  PrAddNodeWithConnection,
  PrWorkflow,
  PrWorkflowLayer,
  PrWorkflowNodeOutput,
  PrWorkflowNodeProcess,
  PrWorkflowNodeProtocol,
  PrWorkflowNodeSource,
  PrWorkflowNodeViewer
} from '@monorepo/protocol';
import {LabProcess} from '../../../../lab-core/model/entities/process/lab-process.entity';
import {Observable} from 'rxjs';
import {LabResource} from '../../../../lab-core/model/entities/resource/lab-resource.entity';
import {map} from 'rxjs/operators';
import {Injectable, NgZone} from '@angular/core';
import {LabResourceService} from '../../../../lab-core/entity-service/lab-resource.service';
import {LabProtocolService} from '../../../../lab-core/entity-service/lab-protocol.service';
import {LabAddProcessWithLink} from './lab-workflow-action.class';

@Injectable({providedIn: 'root'})
export class LabWorkflowFactory {

  constructor(private ngZone: NgZone,
              private protocolService: LabProtocolService,
              private resourceService: LabResourceService) {
  }

  public protocolToWorkflow(protocol: LabProtocol): PrWorkflow {
    const layer = this.createLayer(protocol, true);
    return new PrWorkflow(layer, 'edit', this.ngZone);
  }

  private createLayer(protocol: LabProtocol, rootLayer: boolean): PrWorkflowLayer {

    let layer: PrWorkflowLayer;
    if (rootLayer) {
      layer = PrWorkflowLayer.rootLayer(protocol.id);
    } else {
      layer = new PrWorkflowLayer(protocol.id, protocol.id, protocol.instanceName);
    }

    const protocolLayout = protocol.data.graph.layout;

    for (const key in protocol.data.graph.nodes) {
      const process: LabProcess = protocol.data.graph.nodes[key];
      // retrieve the layout of the process if it exists
      const processLayout = protocolLayout?.getProcess(key) ?? null;
      const node: PrWorkflowNodeProcess = this.labProcessToWorkflowNode(process, processLayout);
      layer.addNode(node);
    }

    for (const link of protocol.data.graph.links) {
      layer.addPrConnection({
        fromNode: link.from.nodeName,
        fromPort: link.from.port,
        toNode: link.to.nodeName,
        toPort: link.to.port
      });
    }

    for (const inter of Object.values(protocol.data.graph.interfaces)) {
      const layout = protocolLayout?.getInterface(inter.name) ?? null;
      layer.addInterface(inter.name, inter.to.nodeName, inter.to.port, layout);
    }
    for (const outer of Object.values(protocol.data.graph.outerfaces)) {
      const layout = protocolLayout?.getOuterface(outer.name) ?? null;
      layer.addOuterface(outer.name, outer.from.nodeName, outer.from.port, layout);
    }
    layer.initNodesPositions();

    return layer;
  }


  public labProcessToWorkflowNode(process: LabProcess, processLayout?: LabProcessLayout): PrWorkflowNodeProcess {
    const getResource = (id: string): Observable<LabResource> => this.resourceService.getById(id);

    let processNode: PrWorkflowNodeProcess;
    if (process.isSource()) {
      processNode = new PrWorkflowNodeSource(process, getResource);
    } else if (process.isOutput()) {
      processNode = new PrWorkflowNodeOutput(process, getResource);
    } else if (process.isViewer()) {
      processNode = new PrWorkflowNodeViewer(process, getResource);
    } else if (process.isProtocol) {
      const layer$: Observable<PrWorkflowLayer> = this.protocolService.getProtocol(process.id).pipe(
        map(protocol => this.createLayer(protocol, false))
      );
      processNode = new PrWorkflowNodeProtocol(process, layer$);
    } else {
      processNode = new PrWorkflowNodeProcess(process);
    }

    // if the position of this process were saved in the protocol, use it
    if (processLayout) {
      processNode.setCoords(processLayout)
    }
    return processNode;
  }

  public labProcessWithLinkToNodeWithLink(processWithLink: LabAddProcessWithLink): PrAddNodeWithConnection {
    const node = this.labProcessToWorkflowNode(processWithLink.process);

    return {
      node: node,
      connection: {
        fromNode: processWithLink.link.from.nodeName,
        fromPort: processWithLink.link.from.port,
        toNode: processWithLink.link.to.nodeName,
        toPort: processWithLink.link.to.port
      }
    };
  }
}
