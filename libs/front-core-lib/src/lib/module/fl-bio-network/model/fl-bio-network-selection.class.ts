import {FlBioNetworkNode} from './fl-bio-network-node.class';
import {FlBioNetworkLink} from './fl-bio-network-node-link.class';

/**
 * Different selection modes
 */
export type FlBioNetworkSelectionMode = 'none' | 'singleNode' | 'singleNodeByClick'
  | 'multipleNodes' | 'linkByValue' | 'nodesByCompartments';


export type FlBioNetworkSelectionEvent = FlBioNetworkSelectionEventSingleNode | FlBioNetworkSelectionEventMultipleNodes
  | FlBioNetworkSelectionEventOther;

export interface FlBioNetworkSelectionEventBase {
  mode: FlBioNetworkSelectionMode;
  nodes?: FlBioNetworkNode[]; // list of selected nodes
  links?: FlBioNetworkLink[]; // list of selected links
}

export interface FlBioNetworkSelectionEventSingleNode extends FlBioNetworkSelectionEventBase {
  mode: 'singleNode' | 'singleNodeByClick'; // to distinguish single node selection by click and by other selectoin
  selectedNode: FlBioNetworkNode;
}

export interface FlBioNetworkSelectionEventMultipleNodes extends FlBioNetworkSelectionEventBase {
  mode: 'multipleNodes';
  selectedNodes: FlBioNetworkNode[];
}


export interface FlBioNetworkSelectionEventOther extends FlBioNetworkSelectionEventBase {
  mode: 'none' | 'linkByValue' | 'nodesByCompartments' | 'singleNodeByClick';
}
