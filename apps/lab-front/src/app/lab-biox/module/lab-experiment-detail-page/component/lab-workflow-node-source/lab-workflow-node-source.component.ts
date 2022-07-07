import {Component, ElementRef, OnInit, Renderer2} from '@angular/core';
import {Observable} from 'rxjs';
import {LabWorkflowManagerState} from '../../state/lab-workflow-manager-state';
import {LabWorkflowActionState} from '../../state/lab-workflow-action-state';
import {LabWorkflowNodeIO} from '../../model/lab-workflow-node-io.class';
import {LabWorkflowNodeDirective} from '../lab-workflow-node/lab-workflow-node.directive';
import {FlDialogService, FlPortalService} from '@monorepo/front-core-lib';

/**
 * Node of an experiment in the workflow specifically for the Source process
 *
 * This component is converted to an angular element to be injectable in html
 */
@Component({
  selector: 'lab-workflow-node-source',
  templateUrl: './lab-workflow-node-source.component.html',
  styleUrls: ['./lab-workflow-node-source.component.scss']
})
export class LabWorkflowNodeSourceComponent extends LabWorkflowNodeDirective implements OnInit {

  title$: Observable<string>;
  resourceId$: Observable<string>;

  node: LabWorkflowNodeIO;

  constructor(workflowManager: LabWorkflowManagerState,
              drawerState: LabWorkflowActionState,
              dialogService: FlDialogService,
              elementRef: ElementRef,
              renderer: Renderer2,
              portalService: FlPortalService) {
    super(workflowManager, drawerState, dialogService, elementRef, renderer, portalService);
  }

  ngOnInit(): void {
    this.initNode();

    this.title$ = this.node.getTitle$();
    this.resourceId$ = this.node.getResourceId$();
  }


}
