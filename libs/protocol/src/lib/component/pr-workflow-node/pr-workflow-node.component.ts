import {Component, OnDestroy, OnInit} from '@angular/core';
import {PrWorkflowNodeProcessDirective} from '../../directive/pr-workflow-node-process.directive';
import {Observable} from 'rxjs';
import {PrWorkflowNodeProtocol} from '../../model/node/pr-workflow-node-protocol.class';

@Component({
  selector: 'pr-workflow-node',
  templateUrl: './pr-workflow-node.component.html',
  styleUrls: ['./pr-workflow-node.component.scss']
})
export class PrWorkflowNodeComponent extends PrWorkflowNodeProcessDirective implements OnInit, OnDestroy {

  layerIsLoading$: Observable<boolean>;
  isProtocol: boolean;

  ngOnInit(): void {
    this.initNode();
    this.layerIsLoading$ = this.workflowManager.layerIsLoading$;
    this.isProtocol = this.node instanceof PrWorkflowNodeProtocol;
  }

  zoomInProtocol(): void {
    if (this.node instanceof PrWorkflowNodeProtocol) {
      this.workflowManager.selectLayer(this.node.currentObject.id, this.node);
    }
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }

}
