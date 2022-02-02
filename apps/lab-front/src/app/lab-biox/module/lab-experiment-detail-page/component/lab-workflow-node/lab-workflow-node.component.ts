import {Component, ElementRef, OnDestroy, OnInit, Renderer2} from '@angular/core';
import {LabWorkflowManagerState} from '../../state/lab-workflow-manager-state';
import {FlDialogService, FlMenuDynamicService, FlStatus} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {LabWorkflowActionState} from '../../state/lab-workflow-action-state';
import {LabWorkflowNodeDirective} from './lab-workflow-node.directive';
import {map} from 'rxjs/operators';

/**
 * Node of an experiment in the workflow
 *
 * This component is converted to an angular element to be injectable in html
 */
@Component({
  selector: 'lab-workflow-node',
  templateUrl: './lab-workflow-node.component.html',
  styleUrls: ['./lab-workflow-node.component.scss']
})
export class LabWorkflowNodeComponent extends LabWorkflowNodeDirective implements OnInit, OnDestroy {

  layerIsLoading$: Observable<boolean>;
  status$: Observable<FlStatus>;

  isProtocol$: Observable<boolean>;

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
    this.layerIsLoading$ = this.workflowManager.layerIsLoading$;
    this.isProtocol$ = this.node.getObject$().pipe(map(process => process.isProtocol));
    this.status$ = this.node.getObject$().pipe(map(process => process.status));
  }

  zoomInProtocol(): void {
    this.workflowManager.selectLayer(this.node.currentObject.id);
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }


}
