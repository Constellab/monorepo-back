import {Injectable} from '@angular/core';
import {ForceGraphInstance, GraphData} from 'force-graph';
import {FlBioNetworkD3} from '../model/fl-bio-network-d3.class';

@Injectable()
export class FlBioNetworkRendererTwoState {

  private graph: ForceGraphInstance;

  // todo a voir si on garde comme ça
  private data: FlBioNetworkD3;


  public init(graph: ForceGraphInstance, data: FlBioNetworkD3): void {
    this.graph = graph;
    this.data = data;
  }

  public forceDraw(): void {
    this.graph.graphData(this.dataToGraph());
  }

  private dataToGraph(): GraphData {
    return {
      nodes: [...this.data.metabolites, ...this.data.reactions],
      links: this.data.links
    } as any; // todo fix
  }
}
