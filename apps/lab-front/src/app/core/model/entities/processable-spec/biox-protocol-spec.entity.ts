import {Expose, Type} from 'class-transformer';
import {FlEntityPaginatedDatasource} from '@monorepo/front-core-lib';
import {BioxProtocolData} from '../proccesable/biox-protocol.entity';
import {BioxProcessableSpec} from './biox-processable-spec.entity';
import {BioxConfigSpecs} from '../biox-config-spec.entity';
import {BioxProtocolLink, BioxProtocolLinkPart} from '../biox-protocol-link.entity';


export class BioxProtocolSpec extends BioxProcessableSpec {

  type: 'gws.typing.ProtocolType';

  @Expose({name: 'model_type'})
  modelType: string;

  @Type(() => BioxProtocolData)
  data: BioxProtocolData;

  // the protocol does not have a config
  getConfigSpecs(): BioxConfigSpecs {
    return null;
  }

  getInputSpecs(): Record<string, string[]> {
    const inputSpecs: Record<string, string[]> = {};
    // we construct the input spec from the interface
    const interfaces: Record<string, BioxProtocolLink> = this.data.graph.interfaces ?? {};

    for(const key of Object.keys(interfaces)){
      // to retrieve the specs, we have to check the node
      // we access the info of which no the interface is connected to
      const part: BioxProtocolLinkPart = interfaces[key].to;

      inputSpecs[key] = this.data.graph.nodes[part.nodeName].inputs[part.port].specs;
    }

    return inputSpecs;
  }

  getOutputSpecs(): Record<string, string[]> {
    const outputSpecs: Record<string, string[]> = {};
    // we construct the input spec from the interface
    const outerfaces: Record<string, BioxProtocolLink> = this.data.graph.outerfaces ?? {};

    for(const key of Object.keys(outerfaces)){
      // to retrieve the specs, we have to check the node
      // we access the info of which no the interface is connected to
      const part: BioxProtocolLinkPart = outerfaces[key].from;

      // retrieve the node and then the output spec of the node
      outputSpecs[key] = this.data.graph.nodes[part.nodeName].outputs[part.port].specs;
    }

    return outputSpecs;
  }


}

export type BioxProtocolSpecDatasource = FlEntityPaginatedDatasource<BioxProtocolSpec>;
