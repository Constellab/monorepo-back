import {SimulationLinkDatum} from 'd3';
import {FlBioNetworkReactionEstimate} from './fl-bio-network.class';
import {FlCoord} from '../../fl-chart/model/fl-d3.class';
import {FlBioNetworkD3Node} from './fl-bio-network-d3-node.class';
import {FlBioNetworkD3Cofactor} from './fl-bio-network-d3-cofactor.class';
import {FlBioNetworkD3Metabolite} from './fl-bio-network-d3-metabolite.class';
import {FlBioNetworkD3Reaction} from './fl-bio-network-d3-reaction.class';
import {FlBioNetworkD3Object} from './fl-bio-network-d3.class';

export class FlBioNetworkD3Link implements SimulationLinkDatum<FlBioNetworkD3Node>, FlBioNetworkD3Object {

  private static id: number = 0;

  id: number;

  source: FlBioNetworkD3Node;
  target: FlBioNetworkD3Node;

  visible: boolean = true;


  constructor(source: FlBioNetworkD3Node, target: FlBioNetworkD3Node,
              public estimate: FlBioNetworkReactionEstimate) {
    this.source = source;
    this.target = target;
    this.id = FlBioNetworkD3Link.id++;
    this.source.departureLinks.push(this);
    this.target.arrivalLinks.push(this);
  }

  get value(): number {
    return typeof this.estimate.value === 'number' ? this.estimate.value : 0;
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

  // return true if the link is linked to a cofactor
  isLinkedToCofactor(): boolean {
    return this.source instanceof FlBioNetworkD3Cofactor || this.target instanceof FlBioNetworkD3Cofactor;
  }

  getLinkWidth(): number {
    return this.absLog10Value + 1;
  }

  // return true if the link is linked to one major metabolite and to a reaction linked to another metabolite
  isMajor(): boolean {
    // cas when the source is a Metabolite and the target a reaction
    return (this.source instanceof FlBioNetworkD3Metabolite && this.target instanceof FlBioNetworkD3Reaction
        && this.source.isMajor() &&
        this.target.getNextNodes().some(node => node instanceof FlBioNetworkD3Metabolite && node.isMajor())) ||
      // cas when the source is a Reaction and the target a metabolite
      (this.target instanceof FlBioNetworkD3Metabolite && this.source instanceof FlBioNetworkD3Reaction
        && this.target.isMajor() &&
        this.source.getPreviousNodes().some(node => node instanceof FlBioNetworkD3Metabolite && node.isMajor()));
  }

  getLevel(): number {
    return Math.min(this.source.getLevel(), this.target.getLevel())
  }
}
