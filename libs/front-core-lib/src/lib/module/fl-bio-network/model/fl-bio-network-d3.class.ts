import {select, SimulationLinkDatum, SimulationNodeDatum} from 'd3';
import {FlBioNetworkMetabolite, FlBioNetworkReaction, FlBioNetworkReactionEstimate} from './fl-bio-network.class';
import {FlCoord, FlD3SelectionSimple} from '../../fl-chart/model/fl-d3.class';
import {FlColorHelper} from '../../../utils/fl-color-helper.class';


// size for the reaction rect
export const flBioNetworkReactionWidth: number = 45;
export const flBioNetworkReactionHeight: number = 12;

// radius of the metabolite round
export const flBioNetworkMetaboliteRadius: number = 7;

// size for the cofactor losange
export const flBioNetworkCofactorSize: number = 5;

// maximum value of a reaction in a pathway
export const flBioNetworkReactionMaxValue: number = 1000;

// class for all node the bio network
export const flBioNetworkNodeClass: string = 'node';

// id for the arrow mid marker
export const flBioNetworkArrowMarkerId: string = 'mid_arrow';

/**
 * Data used to construct to d3 network
 */
export class FlBioxNetworkD3 {

  constructor(public metabolites: FlBioNetworkD3Metabolite[],
              public reactions: FlBioNetworkD3Reaction[],
              public cofactors: FlBioNetworkD3Cofactor[],
              public links: FlBioNetworkD3Link[]) {
  }

  /**
   * return all the nodes
   */
  public getAllNodes(): FlBioNetworkD3Node[] {
    return [...this.getMetabolitesNodes(), ...this.reactions];
  }

  /**
   * return all the metabolites nodes
   */
  public getMetabolitesNodes(): (FlBioNetworkD3Metabolite | FlBioNetworkD3Cofactor)[] {
    return [...this.metabolites, ...this.cofactors];
  }


  // return the min and max value of all links
  public getLinksDomain(): [number, number] {
    let min: number = 0;
    let max: number = 0;

    for (const link of this.links) {
      if (link.value > max) {
        max = link.value;
      } else if (link.value < min) {
        min = link.value;
      }
    }

    return [min, max];
  }

  // return the min and max value of all links
  public getLinksMaxAbsoluteValue(): number {
    let max: number = 0;

    for (const link of this.links) {
      if (link.absValue > max) {
        max = link.absValue;
      }
    }

    return max;
  }
}

export type FlBioNetworkD3NodeType = 'metabolite' | 'reaction' | 'cofactor';

export abstract class FlBioNetworkD3Node implements SimulationNodeDatum {

  // the following properties are set by d3
  // Node’s zero-based index into nodes array. This property is set during the initialization process of a simulation.
  index?: number;
  // Node’s current x-position
  x?: number;
  //Node’s current y-position
  y?: number;
  // Node’s current x-velocity
  vx?: number;
  // Node’s current y-velocity
  vy?: number;
  // Node’s fixed x-position (if position was fixed)
  fx?: number | null;
  // Node’s fixed y-position (if position was fixed)
  fy?: number | null;

  protected constructor(public id: string, public name: string, public type: FlBioNetworkD3NodeType, public color: string,
                        public data: FlBioNetworkMetabolite | FlBioNetworkReaction) {
  }

  public drawNodeAndText(container: SVGElement, textColor: string, backgroundColor: string): void {
    // draw the node and add the class 'node' to each node so we can retrieve them
    this.drawNode(container)
      .attr('class', flBioNetworkNodeClass);

    this.drawNodeText(container, textColor, backgroundColor);
    this.setNodeTitle(container);
  }

  // draw the node element using d3 js
  public abstract drawNode(container: SVGElement): FlD3SelectionSimple<FlBioNetworkD3Node>;

  // get the center of the node
  public getCenter(): FlCoord {
    return this.convertToCenterCoord({
      x: this.x, y: this.y
    });
  }

  public abstract setCenter(coord: FlCoord): void;

  public abstract convertToCenterCoord(coord: FlCoord): FlCoord;

  protected abstract drawNodeText(container: SVGElement, textColor: string, backgroundColor: string): void;

  protected setNodeTitle(container: SVGElement): void {
    select(container).append('title')
      .text((d: FlBioNetworkD3Node) => d.name);
  }

  protected drawTextUnder(element: SVGElement, textColor: string, backgroundColor: string, y: number): void {
    // create the text for metabolite
    select(element).append('text')
      .text((d: FlBioNetworkD3Node) => d.name.substr(0, 20))
      .attr('y', y)
      .attr('dy', '1em')
      .attr('text-anchor', 'middle')
      .attr('fill', textColor)
      .style('text-shadow', this.getTextShadow(backgroundColor))
      .style('font-size', '0.3em');
  }

  protected getTextShadow(backgroundColor: string): string {
    return `-1px -1px 0 ${backgroundColor}, 1px -1px 0 ${backgroundColor},
            -1px 1px 0 ${backgroundColor}, 1px 1px 0 ${backgroundColor}`;
  }

}


export class FlBioNetworkD3Metabolite extends FlBioNetworkD3Node {

  public type: 'metabolite';
  public data: FlBioNetworkMetabolite;

  constructor(id: string, name: string, color: string, data: FlBioNetworkMetabolite) {
    super(id, name, 'metabolite', color, data);
  }


  drawNode(element: SVGElement): FlD3SelectionSimple<FlBioNetworkD3Node> {
    return select(element)
      .append('circle')
      .join('circle')
      .attr('r', flBioNetworkMetaboliteRadius)
      .attr('stroke', (d: FlBioNetworkD3Node) => d.color)
      .attr('stroke-width', 1)
      .attr('fill', 'white') as FlD3SelectionSimple<FlBioNetworkD3Node>;
  }

  protected drawNodeText(element: SVGElement, textColor: string, backgroundColor: string): void {
    this.drawTextUnder(element, textColor, backgroundColor, flBioNetworkMetaboliteRadius);
  }

  setCenter(coord: FlCoord): void {
    this.fx = coord.x;
    this.fy = coord.y;
  }

  convertToCenterCoord(coord: FlCoord): FlCoord {
    return coord;
  }

}

export class FlBioNetworkD3Reaction extends FlBioNetworkD3Node {

  public type: 'reaction';
  public data: FlBioNetworkReaction;

  constructor(id: string, name: string, color: string, data: FlBioNetworkReaction) {
    super(id, name, 'reaction', color, data);
  }


  drawNode(element: SVGElement): FlD3SelectionSimple<FlBioNetworkD3Node> {
    // create the rect of reaction
    return select(element)
      .append('rect')
      .join('rect')
      .attr('class', flBioNetworkNodeClass)
      .attr('width', flBioNetworkReactionWidth)
      .attr('height', flBioNetworkReactionHeight)
      .attr('rx', 3) // round corner
      .attr('ry', 3)
      .attr('stroke', this.color)
      .attr('stroke-width', 1)
      .attr('fill', 'white') as FlD3SelectionSimple<FlBioNetworkD3Node>;
  }

  // draw the text for reaction inside the rect
  protected drawNodeText(element: SVGElement): void {
    // create the text for reaction
    select(element).append('text')
      .text((d: FlBioNetworkD3Node) => d.name.substr(0, 10))
      .attr('x', flBioNetworkReactionWidth / 2) // center x
      .attr('y', flBioNetworkReactionHeight / 2) // center y
      .attr('dominant-baseline', 'middle')
      .attr('text-anchor', 'middle')
      .attr('fill', 'black')
      .style('font-size', '0.5em');
  }


  setCenter(coord: FlCoord): void {
    this.fx = coord.x - (flBioNetworkReactionWidth / 2);
    this.fy = coord.y - (flBioNetworkReactionHeight / 2);
  }

  convertToCenterCoord(coord: FlCoord): FlCoord {
    return {
      x: coord.x + (flBioNetworkReactionWidth / 2),
      y: coord.y + (flBioNetworkReactionHeight / 2)
    };
  }


}

export class FlBioNetworkD3Cofactor extends FlBioNetworkD3Node {
  constructor(id: string, name: string, data: FlBioNetworkMetabolite) {
    super(id, name, 'cofactor', '#ffaa33', data);
  }

  drawNode(container: SVGElement): FlD3SelectionSimple<FlBioNetworkD3Node> {
    return select(container)
      .append('rect')
      .attr('width', flBioNetworkCofactorSize)
      .attr('height', flBioNetworkCofactorSize)
      .attr('rx', 1) // round corner
      .attr('ry', 1)
      .attr('transform', 'translate(2.5, -1) rotate(45)')
      .attr('stroke', (d: FlBioNetworkD3Node) => d.color)
      .attr('stroke-width', 1)
      .attr('fill', 'white') as FlD3SelectionSimple<FlBioNetworkD3Node>;
  }

  protected drawNodeText(container: SVGElement, textColor: string, backgroundColor: string): void {
    this.drawTextUnder(container, textColor, backgroundColor, flBioNetworkCofactorSize);
  }

  setCenter(coord: FlCoord): void {
    this.fx = coord.x - (flBioNetworkCofactorSize / 2);
    this.fy = coord.y - (flBioNetworkCofactorSize / 2);
  }

  convertToCenterCoord(coord: FlCoord): FlCoord {
    return {
      x: coord.x,
      y: coord.y
    };
  }


}

export class FlBioNetworkD3Link
  implements SimulationLinkDatum<FlBioNetworkD3Node> {

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

export function flBioNetworkGetCompartmentColor(compartment: string): string {
  // as the compartment is a single letter, we duplicate it to have really different colors
  return FlColorHelper.stringToRGBColor(compartment + compartment + compartment
    + compartment + compartment + compartment + compartment + compartment + compartment);
}

