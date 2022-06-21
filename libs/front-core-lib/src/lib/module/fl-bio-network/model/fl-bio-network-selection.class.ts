import {FlBioNetworkD3Node} from './fl-bio-network-d3-node.class';
import {FlBioNetworkD3Link} from './fl-bio-network-d3-link.class';

/**
 * Different selection modes
 */
export type FlBioNetworkSelectionMode = 'none' | 'singleNode' | 'singleNodeByClick'
  | 'multipleNodes' | 'linkByValue' | 'nodesByCompartments';


export type FlBioNetworkSelectionEvent = FlBioNetworkSelectionEventSingleNode | FlBioNetworkSelectionEventMultipleNodes
  | FlBioNetworkSelectionEventOther;

export interface FlBioNetworkSelectionEventBase {
  mode: FlBioNetworkSelectionMode;
  nodes?: FlBioNetworkD3Node[]; // list of selected nodes
  links?: FlBioNetworkD3Link[]; // list of selected links
}

export interface FlBioNetworkSelectionEventSingleNode extends FlBioNetworkSelectionEventBase {
  mode: 'singleNode' | 'singleNodeByClick'; // to distinguish single node selection by click and by other selectoin
  selectedNode: FlBioNetworkD3Node;
}

export interface FlBioNetworkSelectionEventMultipleNodes extends FlBioNetworkSelectionEventBase {
  mode: 'multipleNodes';
  selectedNodes: FlBioNetworkD3Node[];
}


export interface FlBioNetworkSelectionEventOther extends FlBioNetworkSelectionEventBase {
  mode: 'none' | 'linkByValue' | 'nodesByCompartments' | 'singleNodeByClick';
}
