import {FlBioNetworkD3Node} from './fl-bio-network-d3-node.class';

// different possible actions for the drawer
export type FlBioNetworkDrawerActionName = 'nodeDetail' | 'config';


/**
 * Value of the state for the drawer
 */
export interface FlBioNetworkDrawerStateValue {
  action: FlBioNetworkDrawerActionName;
  selectedNode: FlBioNetworkD3Node;
}

// List of possible action for the pathway drawer
export type FlBioNetworkDrawerAction = FlBioNetworkActionNodeDetail | FlBioNetworkActionConfig;

/**
 * Action triggered when selecting a node (metabolites or reaction)
 */
export interface FlBioNetworkActionNodeDetail {
  action: 'nodeDetail';
  selectedNode: FlBioNetworkD3Node;
}

/**
 * Action to open pathway config
 */
export interface FlBioNetworkActionConfig {
  action: 'config';
}
