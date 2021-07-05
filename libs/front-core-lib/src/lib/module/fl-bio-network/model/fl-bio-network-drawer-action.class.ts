import {FlBioNetworkD3Node} from './fl-bio-network-d3.class';


// List of possible action for the pathway drawer
export type FlBioNetworkDrawerAction = FlBioNetworkActionNodeDetail | FlBioNetworkActionConfig;

/**
 * Base class for all action of a the pathway drawer
 */
export interface FlBioNetworkDrawerActionBase {
  action: string;
  title: string;
  data: any;
}

/**
 * Action triggered when selecting a node (metabolites or reaction)
 */
export interface FlBioNetworkActionNodeDetail extends FlBioNetworkDrawerActionBase {
  action: 'nodeDetail';
  data: FlBioNetworkD3Node;
}

/**
 * Action to open pathway config
 */
export interface FlBioNetworkActionConfig extends FlBioNetworkDrawerActionBase {
  action: 'config';
  data: void;
}
