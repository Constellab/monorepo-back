import {LabEntity} from '../../global/lab-entity.entity';
import {ClRecordTransform} from '@monorepo/core-lib';
import {BioxProtocolLink} from '../biox-protocol-link.entity';
import {Exclude, Type} from 'class-transformer';
import {BioxProcessable, BioxProcessableData} from './biox-processable.entity';
import {BioxConnection, BioxFlowManager, BioxNode} from '../../global/biox-connection.class';
import {BioxInput} from '../biox-input.entity';
import {ViewModel} from '../../global/view-model.entity';
import {ViewModelDatasourcePaginated} from '../../../utils/view-model.datasource';

export class BioxProtocolGraph extends LabEntity {

  title: string;

  @ClRecordTransform(BioxProtocolLink)
  interfaces: Record<string, BioxProtocolLink>;

  @ClRecordTransform(BioxProtocolLink)
  outerfaces: Record<string, BioxProtocolLink>;

  @ClRecordTransform(BioxProcessable)
  nodes: Record<string, BioxProcessable>;

  @Type(() => BioxProtocolLink)
  links: BioxProtocolLink[];

  public static empty(): BioxProtocolGraph {
    const graph: BioxProtocolGraph = new BioxProtocolGraph();
    graph.interfaces = {};
    graph.outerfaces = {};
    graph.nodes = {};
    graph.links = [];

    return graph;
  }
}


export class BioxProtocolData implements BioxProcessableData {

  title: string;

  description?: string;

  @Type(() => BioxProtocolGraph)
  graph: BioxProtocolGraph;

  public static empty(): BioxProtocolData {
    const data: BioxProtocolData = new BioxProtocolData();
    data.graph = BioxProtocolGraph.empty();
    return data;
  }
}

export class BioxProtocol extends BioxProcessable implements BioxFlowManager {

  @Type(() => BioxProtocolData)
  data: BioxProtocolData;


  @Exclude()
  interfaceNodes: Record<string, BioxNode>;

  @Exclude()
  outerfaceNodes: Record<string, BioxNode>;

  public static empty(): BioxProtocol {
    const protocol: BioxProtocol = new BioxProtocol();
    protocol.inputs = {};
    protocol.outputs = {};
    protocol.data = BioxProtocolData.empty();
    return protocol;
  }

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

  getInputSpecs(): Record<string, BioxInput> {
    return this.inputs;
  }

  getOutputSpecs(): Record<string, BioxInput> {
    return this.outputs;
  }
}

export type BioxProtocolVM = ViewModel<BioxProtocol>;

export type BioxProtocolDatasource = ViewModelDatasourcePaginated<BioxProtocol>;
