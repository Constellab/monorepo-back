import {SimulationLinkDatum, SimulationNodeDatum} from 'd3';
import {FlCoord} from '../../../../model/fl-d3.class';

// size for the reaction rect
export const flPathwayReactionWidth: number = 45;
export const flPathwayReactionHeight: number = 12;

// radius of the metabolite round
export const flPathwayMetaboliteRadius: number = 7;

// maximum value of a reaction in a pathway
export const flPathwayReactionMaxValue: number = 1000;

/**
 * Structured data of a pathway
 */
export interface FlPathway {
  metabolites: FlPathwayMetabolites[];
  reactions: FlPathwayReactions[];
  compartments: Record<string, string>;
}

export interface FlPathwayMetabolites {
  id: string;
  name: string;
  compartment: string;
  charge?: any;
  mass?: any;
  formula?: string;
  chebi_id?: string;
}

export interface FlPathwayReactions {
  id: string;
  name: string;
  metabolites: Record<string, number>;
  lower_bound?: number;
  upper_bound?: number;
  enzyme?: any;
  estimate: FlPathwayReactionValue;
}

export interface FlPathwayReactionValue {
  value: number;
  lower_bound: number;
  upper_bound: number;
}

/**
 * Data used to construct to d3 pathway
 */
export class FlChartPathwayData {
  metabolites: FlChartPathwayNode[] = [];
  reactions: FlChartPathwayNode[] = [];
  links: FlChartPathwayLink<FlChartPathwayNode>[] = [];

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

export type FlChartPathwayNodeType = 'metabolite' | 'reaction';

export class FlChartPathwayNode implements SimulationNodeDatum {

  // the following properties are set by d3
  /**
   * Node’s zero-based index into nodes array. This property is set during the initialization process of a simulation.
   */
  index?: number;
  /**
   * Node’s current x-position
   */
  x?: number;
  /**
   * Node’s current y-position
   */
  y?: number;
  /**
   * Node’s current x-velocity
   */
  vx?: number;
  /**
   * Node’s current y-velocity
   */
  vy?: number;
  /**
   * Node’s fixed x-position (if position was fixed)
   */
  fx?: number | null;
  /**
   * Node’s fixed y-position (if position was fixed)
   */
  fy?: number | null;

  constructor(public id: string, public name: string, public type: FlChartPathwayNodeType, public color: string,
              public data: FlPathwayMetabolites | FlPathwayReactions) {
  }

  getCenter(): FlCoord {
    if (this.type === 'reaction') {
      // get the center of the reaction rect
      return {
        x: this.x + (flPathwayReactionWidth / 2),
        y: this.y + (flPathwayMetaboliteRadius / 2)
      };
    } else {
      // get the center of the metabolite round
      return {
        x: this.x,
        y: this.y
      };
    }
  }


}

export class FlChartPathwayLink<Node extends FlChartPathwayNode>
  implements SimulationLinkDatum<FlChartPathwayNode> {

  source: Node;
  target: Node;
  estimate: FlPathwayReactionValue;

  constructor(source: string, target: string,
              estimate: FlPathwayReactionValue) {
    // the source and target ids, will be replace by node by d3 on init
    this.source = source as any;
    this.target = target as any;
    this.estimate = estimate;
  }

  get value(): number {
    return this.estimate.value;
  }

  get absValue(): number {
    return Math.abs(this.value);
  }


  get absLog2Value(): number {
    return Math.log2(this.absValue + 1);
  }

  get log2Value(): number {
    return this.value > 0 ? this.absLog2Value : -this.absLog2Value;
  }

  get absLog10Value(): number {
    return Math.log10(this.absValue + 1);
  }
}

