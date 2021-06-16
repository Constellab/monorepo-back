import {FlChartPathwayNode} from './fl-chart-pathway.class';


// List of possible action for the pathway drawer
export type FlPathwayDrawerAction = FlPathwayActionNodeDetail | FlPathwayActionConfig;

/**
 * Base class for all action of a the pathway drawer
 */
export interface FlPathwayDrawerActionBase {
  action: string;
  title: string;
  data: any;
}

/**
 * Action triggered when selecting a node (metabolites or reaction)
 */
export interface FlPathwayActionNodeDetail extends FlPathwayDrawerActionBase {
  action: 'nodeDetail';
  data: FlChartPathwayNode;
}

/**
 * Action to open pathway config
 */
export interface FlPathwayActionConfig extends FlPathwayDrawerActionBase {
  action: 'config';
  data: void;
}
