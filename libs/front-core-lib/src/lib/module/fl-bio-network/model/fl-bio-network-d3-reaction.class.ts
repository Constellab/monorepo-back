import {
  FlBioNetworkMetaboliteLevel,
  flBioNetworkMetaboliteLevels,
  flBioNetworkMetaboliteMaxLevel,
  FlBioNetworkReaction
} from './fl-bio-network.class';
import {FlD3SelectionSimple} from '../../fl-chart/model/fl-d3.class';
import {select} from 'd3';
import {FlBioNetworkD3Node} from './fl-bio-network-d3-node.class';
import {FlCoord} from '../../../model/shared/fl-coord.class';

// size for the reaction rect
export const flBioNetworkReactionWidth: number = 5;
export const flBioNetworkReactionHeight: number = 5;
export const flBioNetworkReactionBorderRadius: number = 1;

// maximum value of a reaction in a pathway
export const flBioNetworkReactionMaxValue: number = 1000;

export class FlBioNetworkD3Reaction extends FlBioNetworkD3Node {

  public type: 'reaction';
  public data: FlBioNetworkReaction;
  public pathwayIds: string[]; // list of pathway for the reaction

  constructor(id: string, name: string, fillColor: string, strokeColor: string,
              data: FlBioNetworkReaction, pathwayIds: string[]) {
    super(id, name, 'reaction', fillColor, strokeColor, data);
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
      .attr('stroke-width', 0.25)
      .attr('fill', this.fillColor) as FlD3SelectionSimple<FlBioNetworkD3Node>;
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


    const count = {};
    // get the list of level of linked nodes
    this.getConnectedNodes()
      .filter(node => !(node instanceof FlBioNetworkD3Reaction))
      .map(node => node.getLevel())
      .forEach(level => count[level] = count[level] ? count[level] + 1 : 1);


    // return the lowest level where there is at least 2 nodes link to this reaction
    for (const nodeLevel of flBioNetworkMetaboliteLevels) {
      if (count[nodeLevel] >= 2) {
        return nodeLevel;
      }
    }

    return flBioNetworkMetaboliteMaxLevel;
  }
}
