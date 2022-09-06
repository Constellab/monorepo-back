import {Component, OnInit} from '@angular/core';
import {PrWorkflowNodeProcessDirective} from '../../directive/pr-workflow-node-process.directive';
import {Observable} from 'rxjs';
import {PrWorkflowNodeViewer} from '../../model/node/pr-workflow-node-viewer.class';
import {TdTaskViewerConfig} from '@monorepo/technical-doc';

@Component({
  selector: 'pr-workflow-node-viewer',
  templateUrl: './pr-workflow-node-viewer.component.html',
  styleUrls: ['./pr-workflow-node-viewer.component.scss']
})
export class PrWorkflowNodeViewerComponent extends PrWorkflowNodeProcessDirective implements OnInit {

  isSuccess$: Observable<boolean>;
  isConfigured$: Observable<boolean>;

  node: PrWorkflowNodeViewer;

  ngOnInit(): void {
    this.initNode();
    this.isSuccess$ = this.node.isSuccess$();
    this.isConfigured$ = this.node.isConfigured$();
  }

  callView(): void {
    const config = this.getConfig();
    if (config == null) return;

    const resource = this.node.getCurrentResource();
    if (resource == null) return;

    this.actionState.newAction({
      action: 'showView',
      resourceId: resource.id,
      resourceName: resource.name,
      config: config
    });

  }

  private getConfig(): TdTaskViewerConfig {
    return this.node.currentObject.config.values as TdTaskViewerConfig;
  }

}
