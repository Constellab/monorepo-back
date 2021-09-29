import {SimulationLinkDatum} from 'd3';
import {FlBioNetworkReactionEstimate} from './fl-bio-network.class';
import {FlCoord} from '../../fl-chart/model/fl-d3.class';
import {FlBioNetworkD3Node} from './fl-bio-network-d3.class';

export class FlBioNetworkD3Link implements SimulationLinkDatum<FlBioNetworkD3Node> {

  // provided by d3
  index: number;

  source: FlBioNetworkD3Node;
  target: FlBioNetworkD3Node;

  constructor(source: string, target: string,
              public estimate: FlBioNetworkReactionEstimate) {
    // the source and target ids, will be replace by node by d3 on init
    this.source = source as any;
    this.target = target as any;
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

  isLinkedToNode(nodeIndex: number): boolean {
    return this.source.index === nodeIndex || this.target.index === nodeIndex;
  }

}
