import {LabEntity} from '../../global/lab-entity.entity';
import {ClRecordTransform} from '@monorepo/core-lib';
import {BioxProtocolIOFace, BioxProtocolLink} from '../biox-protocol-link.entity';
import {Exclude, Expose, Type} from 'class-transformer';
import {BioxProcess, BioxProcessData} from './biox-process.entity';
import {BioxConnection, BioxFlowManager, BioxNode} from '../../global/biox-connection.class';
import {BioxIO} from '../biox-io.entity';
import {ViewModel} from '../../global/view-model.entity';
import {ViewModelDatasourcePaginated} from '../../../utils/view-model.datasource';

export class BioxProtocolGraph extends LabEntity {

  title: string;

  @ClRecordTransform(BioxProtocolIOFace)
  interfaces: Record<string, BioxProtocolIOFace>;

  @ClRecordTransform(BioxProtocolIOFace)
  outerfaces: Record<string, BioxProtocolIOFace>;

  @ClRecordTransform(BioxProcess)
  nodes: Record<string, BioxProcess>;

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


export class BioxProtocolData implements BioxProcessData {

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

export class BioxProtocol extends BioxProcess implements BioxFlowManager {

  @Type(() => BioxProtocolData)
  data: BioxProtocolData;

  @Expose({name: 'is_protocol'})
  isProtocol: true

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

  getInputSpecs(): Record<string, BioxIO> {
    return this.inputs;
  }

  getOutputSpecs(): Record<string, BioxIO> {
    return this.outputs;
  }
}

export type BioxProtocolVM = ViewModel<BioxProtocol>;

export type BioxProtocolDatasource = ViewModelDatasourcePaginated<BioxProtocol>;
