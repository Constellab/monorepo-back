import {Component, ElementRef, OnInit, Renderer2} from '@angular/core';
import {LabWorkflowNodeDirective} from '../lab-workflow-node/lab-workflow-node.directive';
import {LabWorkflowManagerState} from '../../state/lab-workflow-manager-state';
import {LabWorkflowActionState} from '../../state/lab-workflow-action-state';
import {Observable} from 'rxjs';
import {LabWorkflowNodeIO} from '../../model/lab-workflow-node-io.class';
import {FlDialogService, FlMenuDynamicService} from '@monorepo/front-core-lib';

/**
 * Node of an experiment in the workflow specifically for the Output process
 *
 * This component is converted to an angular element to be injectable in html
 */
@Component({
  selector: 'lab-workflow-node-output',
  templateUrl: './lab-workflow-node-output.component.html',
  styleUrls: ['./lab-workflow-node-output.component.scss']
})
export class LabWorkflowNodeOutputComponent extends LabWorkflowNodeDirective implements OnInit {

  title$: Observable<string>;
  resourceId$: Observable<string>;

  node: LabWorkflowNodeIO;

  constructor(workflowManager: LabWorkflowManagerState,
              drawerState: LabWorkflowActionState,
              dialogService: FlDialogService,
              elementRef: ElementRef,
              renderer: Renderer2,
              menuDynamicService: FlMenuDynamicService) {
    super(workflowManager, drawerState, dialogService, elementRef, renderer, menuDynamicService);
  }

  ngOnInit(): void {
    this.initNode();

    this.title$ = this.node.getTitle$();
    this.resourceId$ = this.node.getResourceId$();
  }
}
