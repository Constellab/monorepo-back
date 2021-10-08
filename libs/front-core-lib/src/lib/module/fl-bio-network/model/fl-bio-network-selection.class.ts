import {FlBioNetworkD3Node} from './fl-bio-network-d3-node.class';
import {FlBioNetworkD3Link} from './fl-bio-network-d3-link.class';

/**
 * Different selection modes
 */
export type FlBioNetworkSelectionMode = 'none' | 'nodes' | 'linkByValue' | 'nodesByCompartments' | 'pathway'

export interface FlBioNetworkSelectionEvent{
  mode: FlBioNetworkSelectionMode;
  nodes?: FlBioNetworkD3Node[]; // list of selected nodes
  links?: FlBioNetworkD3Link[]; // list of selected links
}
