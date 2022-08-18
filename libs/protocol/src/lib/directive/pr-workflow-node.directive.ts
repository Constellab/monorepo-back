import {Directive, ElementRef, Input, OnDestroy, Renderer2} from '@angular/core';
import {PrWorkflowNodeProcess} from '../model/pr-workflow-node-process.class';

import {PrWorkflowManagerState} from '../state/pr-workflow-manager-state';
import {PrWorkflowActionState} from '../state/pr-workflow-action-state';

@Directive({
  selector: '[prWorkflowNode]'
})
export class PrWorkflowNodeDirective implements OnDestroy{

  // Name of the node
  @Input() name: string;

  node: PrWorkflowNodeProcess;

  private listener: () => void;


  constructor(protected workflowManager: PrWorkflowManagerState,
              protected drawerState: PrWorkflowActionState,
              protected elementRef: ElementRef,
              protected renderer: Renderer2,) {
  }


  protected initNode(): void {
    this.node = this.workflowManager.findNodeWithNameInCurrentLayer(this.name) as PrWorkflowNodeProcess;
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


  ngOnDestroy(): void {
    if (this.listener) {
      this.listener();
    }
  }
}
