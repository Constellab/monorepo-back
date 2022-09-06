import {Directive, ElementRef, Input, OnDestroy} from '@angular/core';
import {PrWorkflowNodeProcess} from '../model/node/pr-workflow-node-process.class';
import {PrWorkflowManagerState} from '../state/pr-workflow-manager-state';
import {FlHtmlHelper} from '@monorepo/front-core-lib';
import {Subscription} from 'rxjs';
import {PrWorkflowMode} from '../model/pr-workflow.class';
import {PrWorkflowNode} from '../model/node/pr-workflow-node.class';

@Directive()
export abstract class PrWorkflowNodeDirective implements OnDestroy {

  // Name of the node
  @Input() name: string;

  node: PrWorkflowNode;

  private subscription: Subscription;

  // use to uniquely identify event function
  private stopEventFunction = (event: any): void => event.stopImmediatePropagation();

  constructor(protected workflowManager: PrWorkflowManagerState,
              protected elementRef: ElementRef) {
  }

  protected initNode(): void {
    this.node = this.workflowManager.findNodeWithNameInCurrentLayer(this.name) as PrWorkflowNodeProcess;
    if (this.node == null) {
      console.error('Couldn\'t find node with name : ' + this.name);
    }

    this.subscription = this.workflowManager.getMode$().subscribe((mode) => {
      this.listenToNodeMouseDown(mode);
    });
  }

  protected listenToNodeMouseDown(mode: PrWorkflowMode): void {
    // retrieve the drawflow element that wrap the node
    const parent: HTMLElement = FlHtmlHelper.getParent(this.elementRef.nativeElement, {className: 'parent-node'});

    if (parent == null) return;

    parent.querySelectorAll('.output').forEach((c: HTMLElement) => {
      this.onNodeMouseDown(c, mode);
    });
  }

  private onNodeMouseDown(c: HTMLElement, mode: PrWorkflowMode): void {
    if (mode === 'readOnly') {
      // disable the mouse event for read only mode
      c.addEventListener('mousedown', this.stopEventFunction, true);
    } else {
      c.removeEventListener('mousedown', this.stopEventFunction, true);
    }
  }


  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
