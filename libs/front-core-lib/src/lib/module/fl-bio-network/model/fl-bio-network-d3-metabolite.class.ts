import {select} from 'd3';
import {FlBioNetworkD3Node} from './fl-bio-network-d3-node.class';
import {FlBioNetworkClusterInfo, FlBioNetworkMetabolite, FlBioNetworkMetaboliteLevel} from './fl-bio-network.class';
import {FlD3SelectionSimple} from '../../fl-chart/model/fl-d3.class';
import {FlCoord} from '../../../model/shared/fl-coord.class';
import {FlBioNetworkD3Reaction} from './fl-bio-network-d3-reaction.class';
import {flBioNetworkCompartmentBiomass} from './fl-bio-network-compartment.class';


// radius of the metabolite round
const flBioNetworkBiomassMetaboliteRadius: number = 20;
const flBioNetworkMinorMetaboliteRadius: number = 6;
const flBioNetworkMajorMetaboliteRadius: number = 12;
const flBioNetworkMajorMetaboliteStroke: number = 3;
const flBioNetworkMinorMetaboliteStroke: number = 1.5;

export class FlBioNetworkD3Metabolite extends FlBioNetworkD3Node {

  public type: 'metabolite';
  public data: FlBioNetworkMetabolite;

  constructor(name: string, public cluster: FlBioNetworkClusterInfo, public level: FlBioNetworkMetaboliteLevel,
              defaultColor: string, strokeColor: string, data: FlBioNetworkMetabolite) {
    super(name, 'metabolite', defaultColor, strokeColor, data);
  }


  drawNode(element: SVGElement): FlD3SelectionSimple<FlBioNetworkD3Node> {
    return select(element)
      .append('circle')
      .join('circle')
      .attr('r', this.getRadius())
      .attr('stroke', this.strokeColor)
      .attr('stroke-width', this.getStrokeWidth())
      .attr('fill', this.defaultColor) as FlD3SelectionSimple<FlBioNetworkD3Node>;
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

  protected _getLevel(): FlBioNetworkMetaboliteLevel {
    return this.level;
  }

  isInPathway(id: string): boolean {

    // check if any connected reaction is in the pathway
    return this.getConnectedNodes().filter(n => n instanceof FlBioNetworkD3Reaction).some(n => n.isInPathway(id));
  }

  isInCluster(id: string): boolean {
    return this.cluster.clusterId === id;
  }



  private getRadius(): number {
    if (this.data.compartment === flBioNetworkCompartmentBiomass.id) return flBioNetworkBiomassMetaboliteRadius;
    return this.isMajor() ? flBioNetworkMajorMetaboliteRadius : flBioNetworkMinorMetaboliteRadius;
  }

  private getStrokeWidth(): number {
    return this.isMajor() ? flBioNetworkMajorMetaboliteStroke : flBioNetworkMinorMetaboliteStroke;
  }

  private getFontTextSize(): string {
    return this.isMajor() ? '1.3em' : '0.5em';
  }


  savePosition(): void {
    const center = this.getCenter();
    const cluster = this.data.layout.clusters[this.cluster.subClusterIds[0]];
    if (cluster) {
      cluster.x = center.x;
      cluster.y = center.y;
    }
  }
}
