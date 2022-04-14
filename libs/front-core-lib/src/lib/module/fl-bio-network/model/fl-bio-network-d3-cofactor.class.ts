import {FlBioNetworkMetabolite, FlBioNetworkMetaboliteLevel} from './fl-bio-network.class';
import {FlD3SelectionSimple} from '../../fl-chart/model/fl-d3.class';
import {select} from 'd3';
import {FlBioNetworkD3Node} from './fl-bio-network-d3-node.class';
import {FlCoord} from '../../../model/shared/fl-coord.class';
import {FlBioNetworkD3Reaction} from './fl-bio-network-d3-reaction.class';

// size for the cofactor losange
const flBioNetworkCofactorSize: number = 3.5;
const flBioNetworkCofactorBorderRadius: number = 0.5;

export class FlBioNetworkD3Cofactor extends FlBioNetworkD3Node {
  public type: 'cofactor';

  public data: FlBioNetworkMetabolite;

  constructor(id: string, name: string, fillColor: string, data: FlBioNetworkMetabolite) {
    super(id, name, 'cofactor', '#ffaa33', fillColor, data);
  }

  drawNode(container: SVGElement): FlD3SelectionSimple<FlBioNetworkD3Node> {
    return select(container)
      .append('rect')
      .attr('width', flBioNetworkCofactorSize)
      .attr('height', flBioNetworkCofactorSize)
      .attr('rx', flBioNetworkCofactorBorderRadius) // round corner
      .attr('ry', flBioNetworkCofactorBorderRadius)
      .attr('transform', 'translate(2.5, -1) rotate(45)')
      .attr('stroke', this.strokeColor)
      .attr('stroke-width', 0.3)
      .attr('fill', this.fillColor) as FlD3SelectionSimple<FlBioNetworkD3Node>;
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

  protected _getLevel(): FlBioNetworkMetaboliteLevel {
    return this.data.level ?? FlBioNetworkMetaboliteLevel.COFACTOR;
  }

  isInPathway(id: string): boolean {
    // check if any connected reaction is in the pathway
    return this.getConnectedNodes().filter(n => n instanceof FlBioNetworkD3Reaction).some(n => n.isInPathway(id));
  }


}
