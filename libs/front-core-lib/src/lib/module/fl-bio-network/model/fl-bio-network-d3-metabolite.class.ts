import {select} from 'd3';
import {FlBioNetworkD3Node} from './fl-bio-network-d3-node.class';
import {FlBioNetworkMetabolite} from './fl-bio-network.class';
import {FlD3SelectionSimple} from '../../fl-chart/model/fl-d3.class';
import {FlBioNetworkD3Reaction} from './fl-bio-network-d3-reaction.class';
import {FlCoord} from '../../../model/shared/fl-coord.class';


// radius of the metabolite round
export const flBioNetworkMinorMetaboliteRadius: number = 7;
export const flBioNetworkMajorMetaboliteRadius: number = 13;

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
      .attr('r', this.getRadius())
      .attr('stroke', (d: FlBioNetworkD3Node) => d.color)
      .attr('stroke-width', 1)
      .attr('fill', 'white') as FlD3SelectionSimple<FlBioNetworkD3Node>;
  }


  protected drawNodeText(element: SVGElement, textColor: string, backgroundColor: string): FlD3SelectionSimple {
    return this.drawTextUnder(element, textColor, backgroundColor, this.getFontTextSize(), this.getRadius());
  }

  convertFromCenterCoord(coord: FlCoord): FlCoord {
    return coord;
  }

  convertToCenterCoord(coord: FlCoord): FlCoord {
    return coord;
  }

  isMajor(): boolean {
    return this.getLevel() === 2;
  }

  getLevel(): number {
    if (this.data.level != null) return this.data.level === 'major' ? 2 : 1;

    // if the level is not defined, take the reaction with the highest level
    return Math.max(1, ...this.getConnectedNodes()
      .filter(node => node instanceof FlBioNetworkD3Reaction)
      .map(node => node.getLevel())
    );
  }


  private getRadius(): number {
    return this.isMajor() ? flBioNetworkMajorMetaboliteRadius : flBioNetworkMinorMetaboliteRadius;
  }

  private getFontTextSize(): string {
    return this.isMajor() ? '1em' : '0.5em';
  }

}
