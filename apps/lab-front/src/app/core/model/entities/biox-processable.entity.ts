import {LabBaseEntity, LabEntity} from '../global/lab-entity.entity';
import {ClCoreJsonConvert, ClDeserializeItem, ClRecordTransformOverride} from '@monorepo/core-lib';
import {FlEntityPaginatedDatasource} from '@monorepo/front-core-lib';
import {BioxConnection, BioxConnectionManager, BioxConnectionPart, BioxConnectionType} from '../global/biox-connection.class';
import {BioxProcessableBase} from './biox-processable-base.entity';
import {Expose, Type} from 'class-transformer';
import {BioxFlowInterface} from './biox-flow.entity';

////////////////////////////////// LINK ///////////////////////////////////////

export class BioxLinkPart implements BioxConnectionPart {

  @Expose({name: 'node'})
  nodeName: string;

  port: string;

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

export class BioxLink implements BioxConnection {

  @Type(() => BioxLinkPart)
  from: BioxLinkPart = null;

  @Type(() => BioxLinkPart)
  to: BioxLinkPart = null;

  getType(): BioxConnectionType {
    return 'node';
  }


}


////////////////////////////////// PROTOCOL ///////////////////////////////////////

/**
 * Deserializer for the protocol graph node
 */
const deserializeGraphNode: ClDeserializeItem<BioxProcessable> = (item: LabBaseEntity): BioxProcessable => {
  if (item.type === 'gws.model.Protocol') {
    return ClCoreJsonConvert.deserializeObject(item, BioxProtocol);
  } else {
    return ClCoreJsonConvert.deserializeObject(item, BioxProcess);
  }
};


export class BioxProtocolGraph extends BioxConnectionManager {

  title: any;

  interfaces: Record<string, any>;

  outerfaces: Record<string, any>;

  layout: Record<string, unknown>;

  @Type(() => BioxLink)
  links: BioxLink[];

  @ClRecordTransformOverride(deserializeGraphNode)
  nodes: Record<string, BioxProcessable> = null;

  getNodesArray(): BioxProcessable[] {
    return Object.keys(this.nodes).map(key => this.nodes[key]);
  }

  getAllConnections(): BioxConnection[] {
    return this.links;
  }

  getNodes(): Record<string, BioxProcessable> {
    return this.nodes;
  }

  getInterfaces(): Record<string, BioxFlowInterface> {
    return this.interfaces;
  }

  getOuterfaces(): Record<string, BioxFlowInterface> {
    return this.outerfaces;
  }


}

export class BioxProtocolData extends LabEntity {
  @Expose({name: 'input_specs'})
  inputSpecs: any;

  @Expose({name: 'output_specs'})
  outputSpecs: any;

  // protocol detail
  @Type(() => BioxProtocolGraph)
  graph: BioxProtocolGraph;
}

export class BioxProtocol extends BioxProcessableBase {

  // python class link
  type: 'gws.model.Protocol';

  @Type(() => BioxProtocolData)
  data: BioxProtocolData;

  objectType: 'protocol' = 'protocol';

}

export type BioxProtocolDatasource = FlEntityPaginatedDatasource<BioxProtocol>;


////////////////////////////////// PROCESS ///////////////////////////////////////

export class BioxProcessData extends LabEntity {

  title: string;

  description: string;
}

export class BioxProcess extends BioxProcessableBase {
  @Type(() => BioxProcessData)
  data: BioxProcessData = null;

  objectType: 'process' = 'process';
}

export type BioxProcessDatasource = FlEntityPaginatedDatasource<BioxProcess>;

// create a union type to improve type checking
export type BioxProcessable = BioxProtocol | BioxProcess;
