import {PrWorkflowNode} from './node/pr-workflow-node.class';

export class PrAddProcessWithLink {

  process: PrWorkflowNode;

  connection: PrConnection;
}

export interface PrConnection {
  fromNode: string;
  fromPort: string;
  toNode: string;
  toPort: string;
}


/**
 * Object to describe the position of a new node relative to another node (usually because they are linked)
 */
export interface PrNodeRelativeCoord {
  nodeName: string;
  position: 'before' | 'after';
  layerId: string;
}
