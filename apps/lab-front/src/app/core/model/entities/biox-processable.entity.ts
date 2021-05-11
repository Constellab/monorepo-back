import {LabEntity} from '../global/lab-entity.entity';
import {BioxConfig} from './biox-config.entity';
import {ClCoreJsonConvert, ClDeserializeItem, ClRecordTransform} from '@monorepo/core-lib';
import {BioxConnection, BioxFlowManager, BioxNode} from '../global/biox-connection.class';
import {Expose, Type} from 'class-transformer';
import {BioxSpec} from './biox-spec.entity';
import {ViewModel} from '../global/view-model.entity';
import {ViewModelDatasourcePaginated} from '../../utils/view-model.datasource';
import {BioxProtocolLink} from './biox-protocol-link.entity';


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

  @Expose({name: 'input'})
  @ClRecordTransform(BioxSpec)
  inputSpecs: Record<string, BioxSpec>;

  @Expose({name: 'output'})
  @ClRecordTransform(BioxSpec)
  outputSpecs: Record<string, BioxSpec>;

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

  @ClRecordTransform(BioxProtocolLink)
  interfaces: Record<string, BioxProtocolLink>;

  @ClRecordTransform(BioxProtocolLink)
  outerfaces: Record<string, BioxProtocolLink>;

  @ClRecordTransform(BioxProcessableBase)
  nodes: Record<string, BioxProcessableBase>;

  @Type(() => BioxProtocolLink)
  links: BioxProtocolLink[];
}


export class BioxProtocolData {

  title: string;

  @Type(() => BioxProtocolGraph)
  graph: BioxProtocolGraph;
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


export class BioxProtocol extends BioxProcessableBase implements BioxFlowManager {

  @Type(() => BioxProtocolData)
  data: BioxProtocolData;


  interfaceNodes: Record<string, BioxNode>;
  outerfaceNodes: Record<string, BioxNode>;

  getConnections(): BioxConnection[] {
    return this.data.graph.links;
  }

  getNodes(): Record<string, BioxNode> {
    return this.data.graph.nodes;
  }

  getInterfacesConnections(): Record<string, BioxProtocolLink> {
    return this.data.graph.interfaces;
  }

  getOuterfacesConnections(): Record<string, BioxProtocolLink> {
    return this.data.graph.outerfaces;
  }

  getInputSpecs(): Record<string, BioxSpec> {
    return this.inputSpecs;
  }

  getOutputSpecs(): Record<string, BioxSpec> {
    return this.outputSpecs;
  }


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

