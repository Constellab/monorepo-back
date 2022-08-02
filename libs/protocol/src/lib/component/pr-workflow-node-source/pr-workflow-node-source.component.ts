import {Component, ElementRef, OnInit, Renderer2} from '@angular/core';
import {PrWorkflowNodeDirective} from '../../directive/pr-workflow-node.directive';
import {PrWorkflowManagerState} from '../../state/pr-workflow-manager-state';
import {PrWorkflowNodeIo} from '../../model/pr-workflow-node-io.class';
import {Observable} from 'rxjs';
import {PrWorkflowActionState} from '../../state/pr-workflow-action-state';

@Component({
  selector: 'pr-workflow-node-source',
  templateUrl: './pr-workflow-node-source.component.html',
  styleUrls: ['./pr-workflow-node-source.component.scss']
})
export class PrWorkflowNodeSourceComponent extends PrWorkflowNodeDirective implements OnInit {

  title$: Observable<string>;
  resourceId$: Observable<string>;

  node: PrWorkflowNodeIo;

  constructor(workflowManager: PrWorkflowManagerState,
              drawerState: PrWorkflowActionState,
              elementRef: ElementRef,
              renderer: Renderer2) {
    super(workflowManager, drawerState, elementRef, renderer);
  }

  ngOnInit(): void {
    this.initNode();

    this.title$ = this.node.getTitle$();
    this.resourceId$ = null
  }


}
