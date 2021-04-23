import {LabEntity} from '../global/lab-entity.entity';
import {BioxConfig} from './biox-config.entity';
import {ClCoreJsonConvert, ClDeserializeItem, ClRecordTransform} from '@monorepo/core-lib';
import {BioxConnection, BioxConnectionManager, BioxConnectionPart, BioxNode} from '../global/biox-connection.class';
import {Expose, Type} from 'class-transformer';
import {BioxResourceVM} from './biox-resource.entity';
import {FlLazyProperty, FlLazyPropertyTransform} from '@monorepo/front-core-lib';
import {BioxResourceService} from '../../entity-service/biox-resource.service';
import {BioxProtocolInterface, BioxProtocolOuterface} from './biox-inteface.entity';
import {BioxSpec} from './biox-spec.entity';
import {ViewModel} from '../global/view-model.entity';
import {ViewModelDatasourcePaginated} from '../../utils/view-model.datasource';

/**
 * Part of a link between different processable in protocol
 */
export class BioxProtocolLinkPart implements BioxConnectionPart {

  @Expose({name: 'node'})
  nodeName: string;

  port: string;

  node: BioxProcessableBase;

  getNodeName(): string {
    return this.nodeName;
  }

  getPort(): string {
    return this.port;
  }

  getNode(): BioxProcessableBase {
    return this.node;
  }

  setNode(node: BioxProcessableBase): void {
    this.node = node;
  }
}

/**
 * Object that contains the resources passed between process
 */
export class BioxProtocolLink implements BioxConnection {

  @Type(() => BioxProtocolLinkPart)
  from: BioxProtocolLinkPart;

  @Type(() => BioxProtocolLinkPart)
  to: BioxProtocolLinkPart;

  @Expose({name: 'resource_uri'})
  @FlLazyPropertyTransform(BioxResourceService)
  resource: FlLazyProperty<BioxResourceVM>;
}

// const bioxFlowGraphDeserialization: ClDeserializeItem<BioxFlowGraph> = (item: any): BioxFlowGraph => {
//   return ClCoreJsonConvert.deserializeObject(item, BioxFlowGraph);
// };

export class BioxProcessableBase extends BioxNode {

  // @ClRecordTransformOverride(bioxFlowBaseDeserialization)
  data: BioxFlowData;

  experiment: {
    uri: string;
  };

  protocol: {
    uri: string;
  };

  @Expose({name: 'is_archived'})
  isArchived: boolean;

  @Expose({name: 'is_deleted'})
  isDeleted: boolean;

  @Type(() => BioxConfig)
  config: BioxConfig;

  @Expose({name: 'instance_name'})
  name: string;

  // todo rename input or inputs from BioxNode (parent)
  @ClRecordTransform(BioxSpec)
  input: Record<string, BioxSpec>;

  @ClRecordTransform(BioxSpec)
  output: Record<string, BioxSpec>;

  public isProtocol(): boolean {
    return this.data.graph != null;
  }

  public isProcess(): boolean {
    return !this.isProtocol();
  }

  public hasConfig(): boolean {
    return this.config.data.specs.hasProperties();
  }
}

export class BioxProtocolGraph extends LabEntity {

  title: string;

  @ClRecordTransform(BioxProtocolInterface)
  interfaces: Record<string, BioxProtocolInterface>;

  @ClRecordTransform(BioxProtocolOuterface)
  outerfaces: Record<string, BioxProtocolOuterface>;

  @ClRecordTransform(BioxProcessableBase)
  nodes: Record<string, BioxProcessableBase>;

  @Type(() => BioxProtocolLink)
  links: BioxProtocolLink[];
}


export class BioxProtocolData extends BioxConnectionManager {

  title: string;

  @Type(() => BioxProtocolGraph)
  graph: BioxProtocolGraph;

  @Expose({name: 'input_specs'})
  @ClRecordTransform(BioxSpec)
  inputSpecs: Record<string, BioxSpec>;

  @Expose({name: 'output_specs'})
  @ClRecordTransform(BioxSpec)
  outputSpecs: Record<string, BioxSpec>;

  getConnections(): BioxConnection[] {
    return this.graph.links;
  }

  getNodes(): Record<string, BioxNode> {
    return this.graph.nodes;
  }


  getInputSpecs(): Record<string, BioxSpec> {
    return this.inputSpecs;
  }

  getOutputSpecs(): Record<string, BioxSpec> {
    return this.outputSpecs;
  }


  getInterfacesConnections(): Record<string, BioxProtocolInterface> {
    return this.graph.interfaces;
  }

  getOuterfacesConnections(): Record<string, BioxProtocolOuterface> {
    return this.graph.outerfaces;
  }
}

export class BioxProcessData {
  title: string;

  description?: string;

  graph: void;
}


/**
 * Deserializer for the flow base data
 */
const bioxFlowBaseDeserialization: ClDeserializeItem<BioxFlowData> = (item: { graph?: any }): BioxFlowData => {
  if (item.graph) {
    return ClCoreJsonConvert.deserializeObject(item, BioxProtocolData);
  } else {
    return ClCoreJsonConvert.deserializeObject(item, BioxProcessData);
  }
};


export class BioxProtocol extends BioxProcessableBase {

  @Type(() => BioxProtocolData)
  data: BioxProtocolData;
}

export class BioxProcess extends BioxProcessableBase {

  @Type(() => BioxProcessData)
  data: BioxProcessData;
}

export type BioxProtocolVM = ViewModel<BioxProtocol>;

export type BioxProtocolDatasource = ViewModelDatasourcePaginated<BioxProtocol>;

export type BioxProcessVM = ViewModel<BioxProcess>;

export type BioxProcessDatasource = ViewModelDatasourcePaginated<BioxProcess>;


// create a union type to improve type checking
export type BioxFlowData = BioxProtocolData | BioxProcessData;


// create a union type to improve type checking
export type BioxProcessable = BioxProtocol | BioxProcess;

