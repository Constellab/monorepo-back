import {Any, JsonConverter, JsonObject, JsonProperty} from 'json2typescript';
import {LabBaseEntity, LabEntity} from './lab-entity.entity';
import {ClCoreJsonConvert, ClRecordConverter} from '@monorepo/core-lib';
import {FlEntityPaginatedDatasource} from '@monorepo/front-core-lib';
import {BioxConnection, BioxConnectionManager, BioxConnectionPart} from './biox-connection.class';
import {BioxProcessableBase} from './biox-processable-base.class';

////////////////////////////////// LINK ///////////////////////////////////////

@JsonObject('BioxLinkPart')
export class BioxLinkPart implements BioxConnectionPart {

  @JsonProperty('node', String)
  nodeName: string = null;

  @JsonProperty('port', String)
  port: string = null;

  node: BioxProcessable;

  getNodeName(): string {
    return this.nodeName;
  }

  getPort(): string {
    return this.port;
  }

  getNode(): BioxProcessable {
    return this.node;
  }

  setNode(node: BioxProcessable): void {
    this.node = node;
  }

}

@JsonObject('BioxLink')
export class BioxLink implements BioxConnection {

  @JsonProperty('from', BioxLinkPart)
  from: BioxLinkPart = null;

  @JsonProperty('to', BioxLinkPart)
  to: BioxLinkPart = null;
}


////////////////////////////////// PROTOCOL ///////////////////////////////////////


/**
 * Converter for the biox processable nodes
 */
@JsonConverter
export class BioxProtocolGraphNodeConverter extends ClRecordConverter<BioxProcessable> {
  deserializeItem(item: LabBaseEntity): BioxProcessable {
    if (item.type === 'gws.model.Protocol') {
      return ClCoreJsonConvert.deserializeObject(item, BioxProtocol);
    } else {
      return ClCoreJsonConvert.deserializeObject(item, BioxProcess);
    }
  }
}

@JsonObject('BioxProtocolGraph')
export class BioxProtocolGraph extends BioxConnectionManager {

  @JsonProperty('title', String, true)
  title: any = null;

  @JsonProperty('interfaces', Any)
  interfaces: Record<string, unknown> = null;

  @JsonProperty('outerfaces', Any)
  outerfaces: Record<string, unknown> = null;

  @JsonProperty('layout', Any)
  layout: Record<string, unknown> = null;

  @JsonProperty('links', [BioxLink])
  links: BioxLink[] = null;

  @JsonProperty('nodes', BioxProtocolGraphNodeConverter)
  nodes: Record<string, BioxProcessable> = null;

  getNodesArray(): BioxProcessable[] {
    return Object.keys(this.nodes).map(key => this.nodes[key]);
  }

  getConnections(): BioxConnection[] {
    return this.links;
  }

  getNodes(): Record<string, BioxProcessable> {
    return this.nodes;
  }


}

@JsonObject('BioxProtocolData')
export class BioxProtocolData extends LabEntity {
  @JsonProperty('input_specs', Any, true)
  inputSpecs: any = null;

  @JsonProperty('output_specs', Any, true)
  outputSpecs: any = null;

  // protocol detail
  @JsonProperty('graph', BioxProtocolGraph, true)
  graph: BioxProtocolGraph = null;
}

@JsonObject('BioxProtocol')
export class BioxProtocol extends BioxProcessableBase {

  // python class link
  @JsonProperty('type', String, true)
  type: 'gws.model.Protocol' = null;

  @JsonProperty('data', BioxProtocolData, true)
  data: BioxProtocolData = null;

  objectType: 'protocol' = 'protocol';

}

export type BioxProtocolDatasource = FlEntityPaginatedDatasource<BioxProtocol>;


////////////////////////////////// PROCESS ///////////////////////////////////////

@JsonObject('BioxProcessData')
export class BioxProcessData extends LabEntity {

  @JsonProperty('title', String, true)
  title: string = null;

  @JsonProperty('description', String, true)
  description: string = null;
}

@JsonObject('BioxProcess')
export class BioxProcess extends BioxProcessableBase {

  @JsonProperty('data', BioxProcessData, true)
  data: BioxProcessData = null;

  objectType: 'process' = 'process';
}

export type BioxProcessDatasource = FlEntityPaginatedDatasource<BioxProcess>;

// create a union type to improve type checking
export type BioxProcessable = BioxProtocol | BioxProcess;
