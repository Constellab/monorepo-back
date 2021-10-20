import {select, SimulationNodeDatum} from 'd3';
import {FlBioNetworkMetabolite, FlBioNetworkReaction} from './fl-bio-network.class';
import {FlCoord, FlD3SelectionSimple} from '../../fl-chart/model/fl-d3.class';
import {FlColorHelper} from '../../../utils/fl-color-helper.class';
import {FlBioNetworkD3Link} from './fl-bio-network-d3-link.class';
import {FlBioNetworkD3Object} from './fl-bio-network-d3.class';

// class for all node the bio network
export const flBioNetworkNodeClass: string = 'node';
export const flBioNetworkNodeTextClass: string = 'node-text';

export type FlBioNetworkD3NodeType = 'metabolite' | 'reaction' | 'cofactor';

export abstract class FlBioNetworkD3Node implements SimulationNodeDatum, FlBioNetworkD3Object {

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

  fx?: number;
  fy?: number;


  visible: boolean = true;

  public departureLinks: FlBioNetworkD3Link[] = [];
  public arrivalLinks: FlBioNetworkD3Link[] = [];

  // list of nodes that are linked to this node
  // It means that when this node moves, all the linked node moves
  public childNodes: FlBioNetworkD3Node[] = [];


  protected constructor(public id: string, public name: string, public type: FlBioNetworkD3NodeType, public color: string,
                        public data: FlBioNetworkMetabolite | FlBioNetworkReaction) {
    if (data.position != null && data.position.x != null && data.position.y != null) {
      this.setCenter(data.position);
      // set the fixed positions
      this.fx = this.x;
      this.fy = this.y;
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
    this.visible = true;
  }

  // draw the node element using d3 js
  public abstract drawNode(container: SVGElement): FlD3SelectionSimple<FlBioNetworkD3Node>;

  // get the center of the node
  public getCenter(): FlCoord {
    return this.convertFromCenterCoord({
      x: this.x, y: this.y
    });
  }

  /**
   * Set the center position of the node
   * return the ids of the moved nodes
   */
  public setCenter(coord: FlCoord): string[] {
    return this.setPosition(this.convertToCenterCoord(coord));
  }

  /**
   * Set the position of the node
   * return the ids of the moved nodes
   */
  public setPosition(coord: FlCoord): string[] {
    const diff: FlCoord = {
      x: coord.x - this.x,
      y: coord.y - this.y
    };

    this.x = coord.x;
    this.y = coord.y;
    this.savePosition();

    return [this.id, ...this.moveLinkedNodes(diff)];
  }

  // add the coord to the current position
  public move(coord: FlCoord): string[] {
    this.x += coord.x;
    this.y += coord.y;
    this.savePosition();

    return [this.id, ...this.moveLinkedNodes(coord)];
  }

  private moveLinkedNodes(coord: FlCoord): string[] {
    // move also the linked nodes
    const movedNode: string[] = [];
    if (this.childNodes) {
      for (const node of this.childNodes) {
        movedNode.push(...node.move(coord));
      }
    }
    return movedNode;
  }

  public abstract convertFromCenterCoord(coord: FlCoord): FlCoord;

  public abstract convertToCenterCoord(coord: FlCoord): FlCoord;

  protected abstract drawNodeText(container: SVGElement, textColor: string, backgroundColor: string): FlD3SelectionSimple | null;

  public abstract getLevel(): number;

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

  public addChildNode(node: FlBioNetworkD3Node): void {
    this.childNodes.push(node);
  }

  public hasPositions(): boolean {
    return this.x != null && this.y != null;
  }

  public getNextNodes(): FlBioNetworkD3Node[] {
    return this.departureLinks.map(link => link.target);
  }

  public getPreviousNodes(): FlBioNetworkD3Node[] {
    return this.arrivalLinks.map(link => link.source);
  }

  public getConnectedNodes(): FlBioNetworkD3Node[] {
    return [...this.getPreviousNodes(), ...this.getNextNodes()];
  }

  public getAllLinks(): FlBioNetworkD3Link[] {
    return [...this.departureLinks, ...this.arrivalLinks];
  }
}


export function flBioNetworkGetCompartmentColor(compartment: string): string {
  // as the compartment is a single letter, we duplicate it to have really different colors
  return FlColorHelper.stringToRGBColor(compartment + compartment + compartment
    + compartment + compartment + compartment + compartment + compartment + compartment);
}

