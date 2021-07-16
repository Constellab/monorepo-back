/**
 * Different selection modes
 */
import {FlBioNetworkD3Link, FlBioNetworkD3Node} from './fl-bio-network-d3.class';

export type FlBioNetworkSelectionMode = 'none' | 'nodes' | 'linkByValue' | 'nodesByCompartments'

export interface FlBioNetworkSelectionEvent{
  mode: FlBioNetworkSelectionMode;
  nodes?: FlBioNetworkD3Node[]; // list of selected nodes
  links?: FlBioNetworkD3Link[]; // list of selected links
}
