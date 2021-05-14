import {WorkflowNodeProcessable} from './workflow-node-processable.class';
import {WorkflowNodeInterface} from './workflow-node-interface.class';
import {WorkflowNodeOuterface} from './workflow-node-outerface.class';


export type WorkflowActionEvent = WorkflowActionSelectNode | WorkflowActionSelectInterface | WorkflowActionSelectOuterface
  | WorkflowActionProcessSelection;

/**
 * Action called when selecting a workflow node
 */
export interface WorkflowActionSelectNode {
  action: 'selectNode';
  processableNode: WorkflowNodeProcessable;
}

/**
 * Action called when selecting a workflow interface
 */
export interface WorkflowActionSelectInterface {
  action: 'selectInterface';
  interface: WorkflowNodeInterface;
}

/**
 * Action called when selecting a workflow outerface
 */
export interface WorkflowActionSelectOuterface {
  action: 'selectOuterface';
  node: WorkflowNodeOuterface;
}

/**
 * Action called when selecting a workflow outerface
 */
export interface WorkflowActionProcessSelection {
  action: 'processSelection';
}

