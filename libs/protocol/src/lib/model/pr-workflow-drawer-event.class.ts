import {PrWorkflowNodeProcess} from './node/pr-workflow-node-process.class';
import {PrWorkflowNodeInterface} from './node/pr-workflow-node-interface.class';
import {PrWorkflowNodeOuterface} from './node/pr-workflow-node-outerface.class';
import {TdTaskViewerConfig} from '@monorepo/technical-doc';

export type PrWorkflowActionEvent =
  PrWorkflowActionSelectNode
  | PrWorkflowActionSelectInterface
  | PrWorkflowActionSelectOuterface
  | PrWorkflowActionShowResource
  | PrWorkflowActionShowView;

export interface PrWorkflowActionBase {
  action: string;
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

/**
 * Action called when selecting a resource
 */
export interface PrWorkflowActionShowResource extends PrWorkflowActionBase {
  action: 'showResource';
  resourceId: string;
}

/**
 * Action called when selecting a resource
 */
export interface PrWorkflowActionShowView extends PrWorkflowActionBase {
  action: 'showView';
  resourceId: string;
  resourceName: string;
  config: TdTaskViewerConfig;
}
