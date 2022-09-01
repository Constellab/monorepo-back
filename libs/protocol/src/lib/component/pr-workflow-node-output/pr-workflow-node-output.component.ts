import {Component, ElementRef, OnInit, Renderer2} from '@angular/core';
import {Observable} from 'rxjs';
import {PrWorkflowNodeIo} from '../../model/pr-workflow-node-io.class';
import {PrWorkflowNodeDirective} from '../../directive/pr-workflow-node.directive';
import {PrWorkflowManagerState} from '../../state/pr-workflow-manager-state';
import {PrWorkflowActionState} from '../../state/pr-workflow-action-state';
import {FlDialogService} from '@monorepo/front-core-lib';

@Component({
  selector: 'pr-workflow-node-output',
  templateUrl: './pr-workflow-node-output.component.html',
  styleUrls: ['./pr-workflow-node-output.component.scss']
})
export class PrWorkflowNodeOutputComponent extends PrWorkflowNodeDirective implements OnInit {

  title$: Observable<string>;
  resourceId$: Observable<string>;

  node: PrWorkflowNodeIo;

  constructor(worflowManager: PrWorkflowManagerState,
              drawerState: PrWorkflowActionState,
              dialogService: FlDialogService,
              elementRef: ElementRef,
              renderer: Renderer2) {
    super(worflowManager, drawerState, dialogService, elementRef, renderer);
  }

  ngOnInit(): void {
    this.initNode();

    this.title$ = this.node.getTitle$();
    this.resourceId$ = null;
  }

}
