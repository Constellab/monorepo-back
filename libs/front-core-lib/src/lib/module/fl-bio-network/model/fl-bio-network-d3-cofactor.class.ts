import {FlBioNetworkMetabolite} from './fl-bio-network.class';
import {FlD3SelectionSimple} from '../../fl-chart/model/fl-d3.class';
import {select} from 'd3';
import {FlBioNetworkD3Node} from './fl-bio-network-d3-node.class';
import {FlCoord} from '../../../model/shared/fl-coord.class';

// size for the cofactor losange
export const flBioNetworkCofactorSize: number = 5;

export class FlBioNetworkD3Cofactor extends FlBioNetworkD3Node {
  public type: 'cofactor';

  visible: boolean = false;

  public data: FlBioNetworkMetabolite;

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

  protected drawNodeText(container: SVGElement, textColor: string, backgroundColor: string): FlD3SelectionSimple {
    return this.drawTextUnder(container, textColor, backgroundColor, '0.3em',
      flBioNetworkCofactorSize, flBioNetworkCofactorSize / 2);
  }


  convertFromCenterCoord(coord: FlCoord): FlCoord {
    return {
      x: coord.x + (flBioNetworkCofactorSize / 2),
      y: coord.y + (flBioNetworkCofactorSize / 2),
    };
  }

  convertToCenterCoord(coord: FlCoord): FlCoord {
    return {
      x: coord.x - (flBioNetworkCofactorSize / 2),
      y: coord.y - (flBioNetworkCofactorSize / 2),
    };
  }

  getLevel(): number {
    return this.data.level ?? 3;
  }
}
