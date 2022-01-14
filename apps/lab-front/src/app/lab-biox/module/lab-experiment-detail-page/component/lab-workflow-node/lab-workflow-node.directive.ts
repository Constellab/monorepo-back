import {Directive, Input} from '@angular/core';
import {LabWorkflowNodeProcess} from '../../model/lab-workflow-node-process.class';
import {LabWorkflowManagerState} from '../../state/lab-workflow-manager-state';
import {LabWorkflowActionState} from '../../state/lab-workflow-action-state';

/**
 * Abstract component directive to extends by Workflow node components
 */
@Directive()
export abstract class LabWorkflowNodeDirective{
  // Name of the node
  @Input() name: string;

  node: LabWorkflowNodeProcess;

  protected constructor(protected workflowManager: LabWorkflowManagerState,
                        protected drawerState: LabWorkflowActionState) {
  }

  protected initNode(): void{
    this.node = this.workflowManager.findNodeWithName(this.name) as LabWorkflowNodeProcess;
    if (this.node == null) {
      console.error('Couldn\'t find node with name : ' + this.name);
    }
  }

  openNodeDetail(): void {
    this.drawerState.newAction({
      action: 'selectNode',
      processNode: this.node,
      title: this.node.title
    });
  }
}
