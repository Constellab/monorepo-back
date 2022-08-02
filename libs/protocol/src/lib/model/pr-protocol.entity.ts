import {PrProcess, PrProcessData} from './pr-process.entity';
import {Exclude, Expose, Type} from 'class-transformer';
import {PrConnection, PrFlowManager, PrNode} from './pr-connection.class';
import {PrIO} from './pr-io.class';
import {PrProtocolIOFace, PrProtocolLink} from './pr-protocol-link.entity';
import {
  PrProtocolGraphInput,
  PrProtocolGraphInputIntOut,
  PrProtocolGraphInputNode
} from './pr-protocol-graph-input.class';
import {PrTask} from './pr-task.entity';
import {ClStringHelper} from '@monorepo/core-lib';

export function createRecordIOFace(record: Record<string, PrProtocolGraphInputIntOut>): Record<string, PrProtocolIOFace> {

  const res: Record<string, PrProtocolIOFace> = {}

  for (const i of Object.keys(record)) {
    res[i] = new PrProtocolIOFace(record[i])
  }

  return res;
}

export function createRecordNodes(record: Record<string, PrProtocolGraphInputNode>): Record<string, PrProcess> {

  const res: Record<string, PrProcess> = {}

  for (const i of Object.keys(record)) {
    if(record[i].graph){
      res[i] = new PrProtocol(record[i], true)
    } else {
      res[i] = new PrTask(record[i])
    }

  }

  return res;
}

export interface PrProtocolGraph {
  interfaces: Record<string, PrProtocolIOFace>;


  outerfaces: Record<string, PrProtocolIOFace>;


  nodes: Record<string, PrProcess>;


  links: PrProtocolLink[];
}


export class PrProtocolData implements PrProcessData {

  title: string;

  description?: string;

  graph: PrProtocolGraph;

  constructor(graph?: PrProtocolGraphInput, title?: string, description?: string) {
    this.title = title;
    this.description = description;
    if (graph) {
      this.graph = {
        nodes: createRecordNodes(graph.nodes),
        links: graph.links.map((link) => new PrProtocolLink(link)),
        outerfaces: createRecordIOFace(graph.outerfaces),
        interfaces: createRecordIOFace(graph.interfaces)
      }
    }
  }


  public static empty(): PrProtocolData {
    const data: PrProtocolData = new PrProtocolData();
    return data;
  }
}

export class PrProtocol extends PrProcess implements PrFlowManager {

  constructor(inputNode?: PrProtocolGraphInputNode, isNotMainProtocol?: boolean) {
    super(inputNode);

    if(isNotMainProtocol){
      this.id = ClStringHelper.generateUUID();
    }

    if(inputNode && inputNode.graph){
      this.data = new PrProtocolData(inputNode.graph);
      this.isProtocol = true;
    }

  }

  @Type(() => PrProtocolData)
  data: PrProtocolData;

  @Expose({name: 'is_protocol'})
  isProtocol: true;

  @Exclude()
  interfaceNodes: Record<string, PrNode>;

  @Exclude()
  outerfaceNodes: Record<string, PrNode>;

  public static empty(): PrProtocol {
    const protocol: PrProtocol = new PrProtocol();
    protocol.inputs = {};
    protocol.outputs = {};
    protocol.data = PrProtocolData.empty();
    return protocol;
  }

  getConnections(): PrConnection[] {
    return this.data.graph.links;
  }

  getNodes(): Record<string, PrProcess> {
    return this.data.graph.nodes;
  }

  getInterfacesConnections(): Record<string, PrProtocolLink> {
    return this.data.graph.interfaces;
  }

  getOuterfacesConnections(): Record<string, PrProtocolLink> {
    return this.data.graph.outerfaces;
  }

  getInputSpecs(): Record<string, PrIO> {
    return this.inputs;
  }

  getOutputSpecs(): Record<string, PrIO> {
    return this.outputs;
  }

  public getProcess(instanceName: string): PrProcess {
    return this.getNodes()[instanceName];
  }

  addNode(node: PrNode): void {
    this.data.graph.nodes[node.name] = node as PrProcess;
  }

  removeNode(nodeName: string): void {
    // todo this is not perfect, because it should remove the connections
    delete this.data.graph.nodes[nodeName];
  }


}
