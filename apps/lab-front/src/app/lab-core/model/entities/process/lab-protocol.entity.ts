import {LabEntity} from '../../global/lab-entity.entity';
import {ClRecordTransform} from '@monorepo/core-lib';
import {LabProtocolIOFace, LabProtocolLink} from '../lab-protocol-link.entity';
import {Expose, Type} from 'class-transformer';
import {LabProcess, LabProcessData} from './lab-process.entity';

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

export interface LabProcessLayout {
  x: number;
  y: number;
}

export class LabProtocolLayout {
  /**
   * Record with key = instance_name, value = layout of the process
   */
  @Expose({name: 'process_layouts'})
  processLayouts: Record<string, LabProcessLayout>;

  getProcess(instanceName: string): LabProcessLayout | null {
    if(this.processLayouts == null) return null;
    return this.processLayouts[instanceName];
  }
}

export class LabProtocolData implements LabProcessData {

  title: string;

  description?: string;

  @Type(() => LabProtocolGraph)
  graph: LabProtocolGraph;

  @Type(() => LabProtocolLayout)
  layout?: LabProtocolLayout;

  public static empty(): LabProtocolData {
    const data: LabProtocolData = new LabProtocolData();
    data.graph = LabProtocolGraph.empty();
    return data;
  }
}


export class LabProtocol extends LabProcess {

  @Type(() => LabProtocolData)
  data: LabProtocolData;

  @Expose({name: 'is_protocol'})
  isProtocol: true;

  public static empty(): LabProtocol {
    const protocol: LabProtocol = new LabProtocol();
    protocol.inputs = {};
    protocol.outputs = {};
    protocol.data = LabProtocolData.empty();
    return protocol;
  }


  getNodes(): Record<string, LabProcess> {
    return this.data.graph.nodes;
  }

  public getProcess(instanceName: string): LabProcess {
    return this.getNodes()[instanceName];
  }
}

