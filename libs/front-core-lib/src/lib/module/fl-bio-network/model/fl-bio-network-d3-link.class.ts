import {SimulationLinkDatum} from 'd3';
import {FlBioNetworkReactionEstimate} from './fl-bio-network.class';
import {FlCoord} from '../../fl-chart/model/fl-d3.class';
import {FlBioNetworkD3Node} from './fl-bio-network-d3-node.class';
import {FlBioNetworkD3Cofactor} from './fl-bio-network-d3-cofactor.class';

export class FlBioNetworkD3Link implements SimulationLinkDatum<FlBioNetworkD3Node> {

  private static id: number = 0;

  id: number;

  source: FlBioNetworkD3Node;
  target: FlBioNetworkD3Node;

  constructor(source: FlBioNetworkD3Node, target: FlBioNetworkD3Node,
              public estimate: FlBioNetworkReactionEstimate) {
    this.source = source;
    this.target = target;
    this.id = FlBioNetworkD3Link.id++;
  }

  get value(): number {
    return this.estimate.value;
  }

  get absValue(): number {
    return Math.abs(this.value);
  }


  get absLog2Value(): number {
    return Math.log2(this.absValue + 1.5);
  }

  get log2Value(): number {
    return this.value > 0 ? this.absLog2Value : -this.absLog2Value;
  }

  get absLog10Value(): number {
    return Math.log10(this.absValue + 1.5);
  }

  // return points for the line with a point in middle to draw the arrow
  public getPolylinePoints(): string {
    const startCoord: FlCoord = this.source.getCenter();
    const endCoord: FlCoord = this.target.getCenter();

    // calculate the middle point
    const midCoord: FlCoord = {
      x: (startCoord.x + endCoord.x) / 2,
      y: (startCoord.y + endCoord.y) / 2
    };

    return `${startCoord.x},${startCoord.y}
            ${midCoord.x},${midCoord.y}
            ${endCoord.x},${endCoord.y} `;
  }

  isLinkedToNode(nodeId: string): boolean {
    return this.source.id === nodeId || this.target.id === nodeId;
  }

  isLinkedToAnyNode(nodeIds: string[]): boolean {
    return nodeIds.some(nodeIndex => this.isLinkedToNode(nodeIndex));
  }

  isLinkedToCofactor(): boolean {
    return this.source instanceof FlBioNetworkD3Cofactor || this.target instanceof FlBioNetworkD3Cofactor;
  }

}
