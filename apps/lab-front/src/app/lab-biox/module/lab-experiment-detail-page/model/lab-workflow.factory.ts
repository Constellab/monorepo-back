import {LabProtocol} from '../../../../lab-core/model/entities/process/lab-protocol.entity';
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

    for (const key in protocol.data.graph.nodes) {
      const process: LabProcess = protocol.data.graph.nodes[key];
      const node: PrWorkflowNodeProcess = this.labProcessToWorkflowNode(process);
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
      layer.addInterface(inter.name, inter.to.nodeName, inter.to.port);
    }
    for (const outer of Object.values(protocol.data.graph.outerfaces)) {
      layer.addOuterface(outer.name, outer.from.nodeName, outer.from.port);
    }
    layer.initNodesPositions();

    return layer;
  }


  public labProcessToWorkflowNode(process: LabProcess): PrWorkflowNodeProcess {
    const getResource = (id: string): Observable<LabResource> => this.resourceService.getById(id);
    if (process.isSource()) {
      return new PrWorkflowNodeSource(process, getResource);
    } else if (process.isOutput()) {
      return new PrWorkflowNodeOutput(process, getResource);
    } else if (process.isViewer()) {
      return new PrWorkflowNodeViewer(process, getResource);
    } else if (process.isProtocol) {
      const layer$: Observable<PrWorkflowLayer> = this.protocolService.getProtocol(process.id).pipe(
        map(protocol => this.createLayer(protocol, false))
      );
      return new PrWorkflowNodeProtocol(process, layer$);
    } else {
      return new PrWorkflowNodeProcess(process);
    }
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
