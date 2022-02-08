import {select} from 'd3';
import {FlBioNetworkD3Node} from './fl-bio-network-d3-node.class';
import {FlBioNetworkMetabolite, FlBioNetworkMetaboliteLevel} from './fl-bio-network.class';
import {FlD3SelectionSimple} from '../../fl-chart/model/fl-d3.class';
import {FlCoord} from '../../../model/shared/fl-coord.class';


// radius of the metabolite round
export const flBioNetworkMinorMetaboliteRadius: number = 4.5;
export const flBioNetworkMajorMetaboliteRadius: number = 6;

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
      .attr('stroke', 'white')
      .attr('stroke-width', 0.5)
      .attr('fill', (d: FlBioNetworkD3Node) => d.color) as FlD3SelectionSimple<FlBioNetworkD3Node>;
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
    return this._getLevel() === FlBioNetworkMetaboliteLevel.MAJOR;
  }

  _getLevel(): FlBioNetworkMetaboliteLevel {
    return this.data.level ?? FlBioNetworkMetaboliteLevel.MINOR;
  }


  private getRadius(): number {
    return this.isMajor() ? flBioNetworkMajorMetaboliteRadius : flBioNetworkMinorMetaboliteRadius;
  }

  private getFontTextSize(): string {
    return this.isMajor() ? '1em' : '0.5em';
  }

}
