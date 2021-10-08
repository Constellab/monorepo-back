import {select, SimulationNodeDatum} from 'd3';
import {FlBioNetworkMetabolite, FlBioNetworkReaction} from './fl-bio-network.class';
import {FlCoord, FlD3SelectionSimple} from '../../fl-chart/model/fl-d3.class';
import {FlColorHelper} from '../../../utils/fl-color-helper.class';

// class for all node the bio network
export const flBioNetworkNodeClass: string = 'node';
export const flBioNetworkNodeTextClass: string = 'node-text';

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


  protected constructor(public id: string, public name: string, public type: FlBioNetworkD3NodeType, public color: string,
                        public data: FlBioNetworkMetabolite | FlBioNetworkReaction) {
    if (data.position != null) {
      this.setCenter(data.position);
    }
  }

  public drawNodeAndText(container: SVGElement, textColor: string, backgroundColor: string): void {
    // draw the node and add the class 'node' to each node so we can retrieve them
    this.drawNode(container)
      .attr('class', flBioNetworkNodeClass);

    const textSelection = this.drawNodeText(container, textColor, backgroundColor);
    if (textSelection != null) {
      textSelection.attr('class', flBioNetworkNodeTextClass);
    }
    this.setNodeTitle(container);
  }

  // draw the node element using d3 js
  public abstract drawNode(container: SVGElement): FlD3SelectionSimple<FlBioNetworkD3Node>;

  // get the center of the node
  public getCenter(): FlCoord {
    return this.convertFromCenterCoord({
      x: this.x, y: this.y
    });
  }

  public setCenter(coord: FlCoord): void {
    this.setPosition(this.convertToCenterCoord(coord));
  }

  public setPosition(coord: FlCoord): void {
    this.x = coord.x;
    this.y = coord.y;
    this.savePosition();
  }

  public abstract convertFromCenterCoord(coord: FlCoord): FlCoord;

  public abstract convertToCenterCoord(coord: FlCoord): FlCoord;

  protected abstract drawNodeText(container: SVGElement, textColor: string, backgroundColor: string): FlD3SelectionSimple | null;

  protected setNodeTitle(container: SVGElement): void {
    select(container).append('title')
      .text((d: FlBioNetworkD3Node) => d.name);
  }

  protected drawTextUnder(element: SVGElement, textColor: string, backgroundColor: string,
                          fontSize: string, y: number, x: number = 0): FlD3SelectionSimple {
    // create the text for metabolite
    return select(element).append('text')
      .text((d: FlBioNetworkD3Node) => d.name.substr(0, 20))
      .attr('x', x)
      .attr('y', y)
      .attr('dy', '1em')
      .attr('text-anchor', 'middle')
      .attr('fill', textColor)
      .style('text-shadow', this.getTextShadow(backgroundColor))
      .style('font-size', fontSize);
  }

  protected getTextShadow(backgroundColor: string): string {
    return `-1px -1px 0 ${backgroundColor}, 1px -1px 0 ${backgroundColor},
            -1px 1px 0 ${backgroundColor}, 1px 1px 0 ${backgroundColor}`;
  }

  public savePosition(): void {
    this.data.position = this.getCenter();
  }

  public initPosition(): void {
    if (this.x == null && this.y == null) {
      this.setPosition({x: 0, y: 0});
    }
  }

}


export function flBioNetworkGetCompartmentColor(compartment: string): string {
  // as the compartment is a single letter, we duplicate it to have really different colors
  return FlColorHelper.stringToRGBColor(compartment + compartment + compartment
    + compartment + compartment + compartment + compartment + compartment + compartment);
}

