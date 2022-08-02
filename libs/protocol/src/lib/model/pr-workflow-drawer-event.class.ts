import {PrWorkflowNodeProcess} from './pr-workflow-node-process.class';
import {PrWorkflowNodeInterface} from './pr-workflow-node-interface.class';
import {PrWorkflowNodeOuterface} from './pr-workflow-node-outerface.class';

export type PrWorkflowActionEvent =
  PrWorkflowActionSelectNode
  | PrWorkflowActionSelectInterface
  | PrWorkflowActionSelectOuterface;

export interface PrWorkflowActionBase {
  action: string;
  title: string;
}

/**
 * Action called when selecting a workflow node
 */
export interface PrWorkflowActionSelectNode extends PrWorkflowActionBase {
  action: 'selectNode';
  processNode: PrWorkflowNodeProcess;
}

/**
 * Action called when selecting a workflow interface
 */
export interface PrWorkflowActionSelectInterface extends PrWorkflowActionBase {
  action: 'selectInterface';
  interface: PrWorkflowNodeInterface;
}

/**
 * Action called when selecting a workflow outerface
 */
export interface PrWorkflowActionSelectOuterface extends PrWorkflowActionBase {
  action: 'selectOuterface';
  node: PrWorkflowNodeOuterface;
}

