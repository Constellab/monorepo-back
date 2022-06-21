import {Injectable} from '@angular/core';
import {Simulation} from 'd3-force';
import {FlBioNetworkD3Node} from '../model/fl-bio-network-d3-node.class';
import {forceLink, forceManyBody, forceSimulation} from 'd3';
import {FlBioNetworkD3} from '../model/fl-bio-network-d3.class';


@Injectable()
export class FlBioNetworkSimulationState {

  private simulation: Simulation<FlBioNetworkD3Node, any>;
  private simulationEnded: boolean = false;


  public initSimulation(data: FlBioNetworkD3): Promise<void> {
    this.simulationEnded = false;
    this.simulation = forceSimulation(data.getMetabolitesAndReactions())
      .force('link',
        forceLink(data.links)
        // forceLink(data.links.filter(link => link.getLevel() !== FlBioNetworkMetaboliteLevel.COFACTOR))
        // .id((d: FlBioNetworkD3Node) => d.id)
      )
      .force('charge', forceManyBody()).alphaDecay(0.05);

    return new Promise((resolve) => {
      this.simulation.on('end', () => {
        this.endSimulation();
        resolve();
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
