import {
  FlBioNetworkMetaboliteLevel,
  flBioNetworkMetaboliteMaxLevel,
  FlBioNetworkReaction
} from './fl-bio-network.class';
import {FlD3SelectionSimple} from '../../fl-chart/model/fl-d3.class';
import {select} from 'd3';
import {FlBioNetworkD3Node} from './fl-bio-network-d3-node.class';
import {FlCoord} from '../../../model/shared/fl-coord.class';

// size for the reaction rect
export const flBioNetworkReactionWidth: number = 8;
export const flBioNetworkReactionHeight: number = 8;
export const flBioNetworkReactionBorderRadius: number = 1;

// maximum value of a reaction in a pathway
export const flBioNetworkReactionMaxValue: number = 1000;

export class FlBioNetworkD3Reaction extends FlBioNetworkD3Node {

  public type: 'reaction';
  public data: FlBioNetworkReaction;
  public pathwayIds: string[]; // list of pathway for the reaction

  constructor(id: string, name: string, defaultColor: string, strokeColor: string,
              data: FlBioNetworkReaction, pathwayIds: string[]) {
    super(id, name, 'reaction', defaultColor, strokeColor, data);
    this.pathwayIds = pathwayIds;
  }


  drawNode(element: SVGElement): FlD3SelectionSimple<FlBioNetworkD3Node> {
    // create the rect of reaction
    return select(element)
      .append('rect')
      .join('rect')
      .attr('width', flBioNetworkReactionWidth)
      .attr('height', flBioNetworkReactionHeight)
      .attr('rx', flBioNetworkReactionBorderRadius) // round corner
      .attr('ry', flBioNetworkReactionBorderRadius)
      .attr('stroke', this.strokeColor)
      .attr('stroke-width', 1)
      .attr('fill', this.defaultColor) as FlD3SelectionSimple<FlBioNetworkD3Node>;
  }

  // draw the text for reaction inside the rect
  protected drawNodeText(): null {
    return null;
    // // create the text for reaction
    // select(element).append('text')
    //   .text((d: FlBioNetworkD3Node) => d.name.substr(0, 10))
    //   .attr('x', flBioNetworkReactionWidth / 2) // center x
    //   .attr('y', flBioNetworkReactionHeight / 2) // center y
    //   .attr('dominant-baseline', 'middle')
    //   .attr('text-anchor', 'middle')
    //   .attr('fill', 'black')
    //   .style('font-size', '0.5em');
  }


  convertFromCenterCoord(coord: FlCoord): FlCoord {
    return {
      x: coord.x + (flBioNetworkReactionWidth / 2),
      y: coord.y + (flBioNetworkReactionHeight / 2)
    };
  }

  convertToCenterCoord(coord: FlCoord): FlCoord {
    return {
      x: coord.x - (flBioNetworkReactionWidth / 2),
      y: coord.y - (flBioNetworkReactionHeight / 2)
    };
  }


  public isInPathway(id: string): boolean {
    return this.pathwayIds.includes(id);
  }

  // The level of the reaction is the lowest level of connected metabolites
  // Exclude connected FlBioNetworkD3Reaction to avoid infinite loop
  protected _getLevel(): FlBioNetworkMetaboliteLevel {
    if (this.data.level) return this.data.level;


    const levels: number[] = this.getConnectedNodes()
      .filter(node => !(node instanceof FlBioNetworkD3Reaction))
      .map(node => node.getLevel()).sort();

    // return the second-lowest level, this mean that there is at least 2 metabolites linked
    // to this reaction with the level or lower
    if (levels.length >= 2) {
      return levels[1];
    }

    return flBioNetworkMetaboliteMaxLevel;
  }
}
