import {WorkflowNodeProcessable} from './workflow-node-processable.class';
import {WorkflowNodeInterface} from './workflow-node-interface.class';
import {WorkflowNodeOuterface} from './workflow-node-outerface.class';


export type WorkflowActionEvent = WorkflowActionSelectNode | WorkflowActionSelectInterface | WorkflowActionSelectOuterface
  | WorkflowActionProcessSelection;

export interface WorkflowActionBase{
  action: string;
  title: string;
}

/**
 * Action called when selecting a workflow node
 */
export interface WorkflowActionSelectNode extends WorkflowActionBase{
  action: 'selectNode';
  processableNode: WorkflowNodeProcessable;
}

/**
 * Action called when selecting a workflow interface
 */
export interface WorkflowActionSelectInterface extends WorkflowActionBase {
  action: 'selectInterface';
  interface: WorkflowNodeInterface;
}

/**
 * Action called when selecting a workflow outerface
 */
export interface WorkflowActionSelectOuterface extends WorkflowActionBase {
  action: 'selectOuterface';
  node: WorkflowNodeOuterface;
}

/**
 * Action called when selecting a workflow outerface
 */
export interface WorkflowActionProcessSelection extends WorkflowActionBase {
  action: 'processSelection';
}

