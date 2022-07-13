import {Injectable} from '@angular/core';
import {Simulation} from 'd3-force';
import {FlBioNetworkNode} from '../model/fl-bio-network-node.class';
import {forceLink, forceManyBody, forceSimulation} from 'd3';
import {FlBioNetworkGraph} from '../model/fl-bio-network-graph.class';
import {FlBioNetworkMetaboliteLevel} from '../model/fl-bio-network.class';


@Injectable()
export class FlBioNetworkSimulationState {

  private simulation: Simulation<FlBioNetworkNode, any>;
  private simulationEnded: boolean = false;


  public initSimulation(data: FlBioNetworkGraph): Promise<void> {
    this.simulationEnded = false;
    console.log('[BioNetwork] start simulation ');
    const startTime = new Date().getTime();
    this.simulation = forceSimulation(data.getMetabolitesAndReactions())
      .force('link',
        // forceLink(data.links)
        forceLink(data.links.filter(link => link.getLevel() !== FlBioNetworkMetaboliteLevel.COFACTOR))
        // .id((d: FlBioNetworkD3Node) => d.id)
      )
      .force('charge', forceManyBody()).alphaDecay(0.5);

    return new Promise((resolve) => {
      this.simulation.on('end', () => {
        this.endSimulation();
        resolve();
        console.log(`[BioNetwork] end simulation ${(new Date().getTime() - startTime) / 1000} seconds`);
      });
    });
  }

  // disable all force so the user can move the node independently
  private endSimulation(): void {
    if (!this.simulationEnded) {
      // clear all forces, so the user can drag easily
      this.simulation.force('link', null);
      this.simulation.force('charge', null);
      this.simulation.force('center', null);
      this.simulation.force('collide', null);
      this.simulation.stop();
      this.simulationEnded = true;
    }
  }
}
