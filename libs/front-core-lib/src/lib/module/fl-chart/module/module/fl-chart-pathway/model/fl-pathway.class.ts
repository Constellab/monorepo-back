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
  chebi_id ?: string;
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
export interface FlChartPathwayData {
  metabolites: FlChartPathwayNode[];
  reactions: FlChartPathwayNode[];
  links: FlChartPathwayLink<string | FlChartPathwayNode>[];
}

export type FlChartPathwayNodeType = 'metabolite' | 'reaction';

export class FlChartPathwayNode implements SimulationNodeDatum {
  id: string;
  name: string;
  type: FlChartPathwayNodeType;

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

  constructor(id: string, name: string, type: FlChartPathwayNodeType) {
    this.id = id;
    this.name = name;
    this.type = type;
  }



}

export interface FlChartPathwayLink<Node extends (string | FlChartPathwayNode)>
  extends SimulationLinkDatum<FlChartPathwayNode> {
  source: Node;
  target: Node;
  value: number;
}

