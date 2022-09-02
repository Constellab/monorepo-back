import {Component, ElementRef, OnInit, Renderer2} from '@angular/core';
import {LabWorkflowNodeDirective} from '../lab-workflow-node/lab-workflow-node.directive';
import {LabWorkflowManagerState} from '../../state/lab-workflow-manager-state';
import {LabWorkflowActionState} from '../../state/lab-workflow-action-state';
import {FlDialogService, FlPortalService} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {LabWorkflowNodeIO} from '../../model/lab-workflow-node-io.class';
import {LabTaskViewerConfig} from '../../../../../lab-core/model/entities/lab-typing-name.class';
import {
  LabResourceViewDetailDialogComponent,
  LabResourceViewDetailDialogInput
} from '../../../../../lab-core/entity-module/lab-resource-core/component/lab-resource-view-detail-dialog/lab-resource-view-detail-dialog.component';
import {map} from 'rxjs/operators';


/**
 * Node in the workflow for the specific node ViewTask
 */
@Component({
  selector: 'lab-workflow-node-view',
  templateUrl: './lab-workflow-node-view.component.html',
  styleUrls: ['./lab-workflow-node-view.component.scss']
})
export class LabWorkflowNodeViewComponent extends LabWorkflowNodeDirective implements OnInit {

  title$: Observable<string>;
  isSuccess$: Observable<boolean>;
  isConfigured$: Observable<boolean>;

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
    this.isSuccess$ = this.node.getObject$().pipe(map(process => process.status.value === 'SUCCESS'));
    this.isConfigured$ = this.node.getObject$().pipe(
      map(process => {
        const config = process.getConfigValues() as LabTaskViewerConfig;
        return config != null && config.view_config != null;
      })
    );

  }

  openNodeDetail(): void {
    this.drawerState.newAction({
      action: 'selectNode',
      processNode: this.node,
      title: this.node.title
    });
  }

  callView(): void {
    const config = this.getConfig();
    if (config == null) return;

    const resource = this.node.getCurrentResource();
    if (resource == null) return;

    const data: LabResourceViewDetailDialogInput = {
      mode: 'view',
      resourceId: resource.id,
      resourceName: resource.name,
      viewMethodName: config.view_config.view_method_name,
      config: config.view_config.config_values,
      transformers: config.view_config.transformers,
      saveViewConfig: true,
    };
    this.dialogService.openBigDialog(LabResourceViewDetailDialogComponent, {data: data});
  }

  private getConfig(): LabTaskViewerConfig {
    return this.node.currentObject.getConfigValues() as LabTaskViewerConfig;
  }

}
