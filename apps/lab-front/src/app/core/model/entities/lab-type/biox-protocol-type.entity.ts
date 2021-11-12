import {Expose, Type} from 'class-transformer';
import {BioxProtocolData} from '../process/biox-protocol.entity';
import {BioxProcessType} from './biox-process-type.entity';
import {BioxConfigSpecs} from '../biox-config-spec.entity';
import {BioxProtocolLink, BioxProtocolLinkPart} from '../biox-protocol-link.entity';
import {BioxIOSpec} from '../biox-io.entity';


export class BioxProtocolType extends BioxProcessType {

  @Expose({name: 'model_type'})
  modelType: string;

  @Type(() => BioxProtocolData)
  data: BioxProtocolData;

  // the protocol does not have a config
  getConfigSpecs(): BioxConfigSpecs {
    return null;
  }

  getInputSpecs(): Record<string, BioxIOSpec[]> {
    const inputSpecs: Record<string, BioxIOSpec[]> = {};
    // we construct the input spec from the interface
    const interfaces: Record<string, BioxProtocolLink> = this.data.graph.interfaces ?? {};

    for (const key of Object.keys(interfaces)) {
      // to retrieve the specs, we have to check the node
      // we access the info of which no the interface is connected to
      const part: BioxProtocolLinkPart = interfaces[key].to;

      inputSpecs[key] = this.data.graph.nodes[part.nodeName].inputs[part.port].specs;
    }

    return inputSpecs;
  }

  getOutputSpecs(): Record<string, BioxIOSpec[]> {
    const outputSpecs: Record<string, BioxIOSpec[]> = {};
    // we construct the input spec from the interface
    const outerfaces: Record<string, BioxProtocolLink> = this.data.graph.outerfaces ?? {};

    for (const key of Object.keys(outerfaces)) {
      // to retrieve the specs, we have to check the node
      // we access the info of which no the interface is connected to
      const part: BioxProtocolLinkPart = outerfaces[key].from;

      // retrieve the node and then the output spec of the node
      outputSpecs[key] = this.data.graph.nodes[part.nodeName].outputs[part.port].specs;
    }

    return outputSpecs;
  }
}



