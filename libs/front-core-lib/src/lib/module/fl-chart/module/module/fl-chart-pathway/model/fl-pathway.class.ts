import {SimulationLinkDatum, SimulationNodeDatum} from 'd3';

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
  metabolites: Record<string, number>,
  lower_bound?: number,
  upper_bound?: number
  enzyme?: any;
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


}

export class FlChartPathwayLink<Node extends FlChartPathwayNode>
  implements SimulationLinkDatum<FlChartPathwayNode> {

  source: Node;
  target: Node;
  value: number;
  absValue: number;

  constructor(source: string, target: string,
              value: number) {
    // the source and target ids, will be replace by node by d3 on init
    this.source = source as any;
    this.target = target as any;
    this.value = value;
    this.absValue = Math.abs(value);
  }

  /**
   * return true if the link is positive, on the right of the reaction
   *
   * If positive
   *    Source = reaction (rect)
   *    Target = metabolite (circle)
   * If negative
   *    Source = metabolite (circle)
   *    Target = reaction (rect)
   */
  public isPositive(): boolean {
    return this.value > 0;
  }
}

