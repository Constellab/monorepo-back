import {LabWorkflowNodeProcess} from './lab-workflow-node-process.class';
import {LabWorkflowNodeInterface} from './lab-workflow-node-interface.class';
import {LabWorkflowNodeOuterface} from './lab-workflow-node-outerface.class';


export type LabWorkflowActionEvent = LabWorkflowActionSelectNode | LabWorkflowActionSelectInterface | LabWorkflowActionSelectOuterface;

export interface LabWorkflowActionBase {
  action: string;
  title: string;
}

/**
 * Action called when selecting a workflow node
 */
export interface LabWorkflowActionSelectNode extends LabWorkflowActionBase{
  action: 'selectNode';
  processNode: LabWorkflowNodeProcess;
}

/**
 * Action called when selecting a workflow interface
 */
export interface LabWorkflowActionSelectInterface extends LabWorkflowActionBase {
  action: 'selectInterface';
  interface: LabWorkflowNodeInterface;
}

/**
 * Action called when selecting a workflow outerface
 */
export interface LabWorkflowActionSelectOuterface extends LabWorkflowActionBase {
  action: 'selectOuterface';
  node: LabWorkflowNodeOuterface;
}

