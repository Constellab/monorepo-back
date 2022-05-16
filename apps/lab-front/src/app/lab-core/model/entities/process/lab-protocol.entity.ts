import {LabEntity} from '../../global/lab-entity.entity';
import {ClRecordTransform} from '@monorepo/core-lib';
import {LabProtocolIOFace, LabProtocolLink} from '../lab-protocol-link.entity';
import {Exclude, Expose, Type} from 'class-transformer';
import {LabProcess, LabProcessData} from './lab-process.entity';
import {LabConnection, LabFlowManager, LabNode} from '../../global/lab-connection.class';
import {LabIO} from '../lab-io.entity';

export class LabProtocolGraph extends LabEntity {

  title: string;

  @ClRecordTransform(LabProtocolIOFace)
  interfaces: Record<string, LabProtocolIOFace>;

  @ClRecordTransform(LabProtocolIOFace)
  outerfaces: Record<string, LabProtocolIOFace>;

  @ClRecordTransform(LabProcess)
  nodes: Record<string, LabProcess>;

  @Type(() => LabProtocolLink)
  links: LabProtocolLink[];

  public static empty(): LabProtocolGraph {
    const graph: LabProtocolGraph = new LabProtocolGraph();
    graph.interfaces = {};
    graph.outerfaces = {};
    graph.nodes = {};
    graph.links = [];

    return graph;
  }
}


export class LabProtocolData implements LabProcessData {

  title: string;

  description?: string;

  @Type(() => LabProtocolGraph)
  graph: LabProtocolGraph;

  public static empty(): LabProtocolData {
    const data: LabProtocolData = new LabProtocolData();
    data.graph = LabProtocolGraph.empty();
    return data;
  }
}

export class LabProtocol extends LabProcess implements LabFlowManager {

  @Type(() => LabProtocolData)
  data: LabProtocolData;

  @Expose({name: 'is_protocol'})
  isProtocol: true;

  @Exclude()
  interfaceNodes: Record<string, LabNode>;

  @Exclude()
  outerfaceNodes: Record<string, LabNode>;

  public static empty(): LabProtocol {
    const protocol: LabProtocol = new LabProtocol();
    protocol.inputs = {};
    protocol.outputs = {};
    protocol.data = LabProtocolData.empty();
    return protocol;
  }

  getConnections(): LabConnection[] {
    return this.data.graph.links;
  }

  getNodes(): Record<string, LabProcess> {
    return this.data.graph.nodes;
  }

  getInterfacesConnections(): Record<string, LabProtocolLink> {
    return this.data.graph.interfaces;
  }

  getOuterfacesConnections(): Record<string, LabProtocolLink> {
    return this.data.graph.outerfaces;
  }

  getInputSpecs(): Record<string, LabIO> {
    return this.inputs;
  }

  getOutputSpecs(): Record<string, LabIO> {
    return this.outputs;
  }

  public getProcess(instanceName: string): LabProcess {
    return this.getNodes()[instanceName];
  }

  addNode(node: LabNode): void {
    this.data.graph.nodes[node.name] = node as LabProcess;
  }

  removeNode(nodeName: string): void {
    // todo this is not perfect, because it should remove the connections
    delete this.data.graph.nodes[nodeName];
  }



}
