import {FlBioNetworkD3Node} from './fl-bio-network-d3-node.class';
import {FlBioNetworkD3Link} from './fl-bio-network-d3-link.class';

/**
 * Different selection modes
 */
export type FlBioNetworkSelectionMode = 'none' | 'nodes' | 'linkByValue' | 'nodesByCompartments';


export type FlBioNetworkSelectionEvent = FlBioNetworkSelectionEventNodes | FlBioNetworkSelectionEventOther;

export interface FlBioNetworkSelectionEventBase {
  mode: FlBioNetworkSelectionMode;
  nodes?: FlBioNetworkD3Node[]; // list of selected nodes
  links?: FlBioNetworkD3Link[]; // list of selected links
}

export interface FlBioNetworkSelectionEventNodes extends FlBioNetworkSelectionEventBase {
  mode: 'nodes';
  selectedNode: FlBioNetworkD3Node; // the node that was clicked on
}

export interface FlBioNetworkSelectionEventOther extends FlBioNetworkSelectionEventBase {
  mode: 'none' | 'linkByValue' | 'nodesByCompartments';
}
