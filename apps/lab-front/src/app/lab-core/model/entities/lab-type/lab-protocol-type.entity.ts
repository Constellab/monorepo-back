import {Type} from 'class-transformer';
import {LabProtocolGraph} from '../process/lab-protocol.entity';
import {LabProcessType, LabProcessTypeDetail} from './lab-process-type.entity';
import {LabConfigSpecs} from '../lab-config-spec.entity';
import {LabProtocolLink, LabProtocolLinkPart} from '../lab-protocol-link.entity';
import {LabIOSpec} from '../lab-io.entity';

export class LabProtocolTypeDetail implements LabProcessTypeDetail {

  @Type(() => LabProtocolGraph)
  graph: LabProtocolGraph;

  // the protocol does not have a config
  getConfigSpecs(): LabConfigSpecs {
    return null;
  }

  getInputSpecs(): Record<string, LabIOSpec> {
    const inputSpecs: Record<string, LabIOSpec> = {};
    // we construct the input spec from the interface
    const interfaces: Record<string, LabProtocolLink> = this.graph.interfaces ?? {};

    for (const key of Object.keys(interfaces)) {
      // to retrieve the specs, we have to check the node
      // we access the info of which no the interface is connected to
      const part: LabProtocolLinkPart = interfaces[key].to;

      inputSpecs[key] = this.graph.nodes[part.nodeName].inputs[part.port].specs;
    }

    return inputSpecs;
  }

  getOutputSpecs(): Record<string, LabIOSpec> {
    const outputSpecs: Record<string, LabIOSpec> = {};
    // we construct the input spec from the interface
    const outerfaces: Record<string, LabProtocolLink> = this.graph.outerfaces ?? {};

    for (const key of Object.keys(outerfaces)) {
      // to retrieve the specs, we have to check the node
      // we access the info of which no the interface is connected to
      const part: LabProtocolLinkPart = outerfaces[key].from;

      // retrieve the node and then the output spec of the node
      outputSpecs[key] = this.graph.nodes[part.nodeName].outputs[part.port].specs;
    }

    return outputSpecs;
  }
}

export class LabProtocolType extends LabProcessType {
  @Type(() => LabProtocolTypeDetail)
  type: LabProtocolTypeDetail;
}



