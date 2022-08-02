import {Component, ElementRef, OnDestroy, OnInit, Renderer2} from '@angular/core';
import {PrWorkflowNodeDirective} from '../../directive/pr-workflow-node.directive';
import {map} from 'rxjs/operators';
import {PrWorkflowManagerState} from '../../state/pr-workflow-manager-state';
import {Observable} from 'rxjs';
import {FlStatus} from '@monorepo/front-core-lib';
import {PrWorkflowActionState} from '../../state/pr-workflow-action-state';
import {PrProtocol} from '../../model/pr-protocol.entity';

@Component({
  selector: 'pr-workflow-node',
  templateUrl: './pr-workflow-node.component.html',
  styleUrls: ['./pr-workflow-node.component.scss']
})
export class PrWorkflowNodeComponent extends PrWorkflowNodeDirective implements OnInit, OnDestroy {

  layerIsLoading$: Observable<boolean>;
  status$: Observable<FlStatus>;
  isProtocol$: Observable<boolean>;

  constructor(workflowManager: PrWorkflowManagerState,
              drawerState: PrWorkflowActionState,
              elementRef: ElementRef,
              renderer: Renderer2) {
    super(workflowManager, drawerState, elementRef, renderer);
  }

  ngOnInit(): void {
    this.initNode();
    this.layerIsLoading$ = this.workflowManager.layerIsLoading$;
    this.isProtocol$ = this.node.getObject$().pipe(map(process => process.isProtocol));
    this.status$ = this.node.getObject$().pipe(map(process => process.status));
  }

  zoomInProtocol(): void {
    this.workflowManager.selectLayer(this.node.currentObject.id, this.node.currentObject as PrProtocol);
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }

}
