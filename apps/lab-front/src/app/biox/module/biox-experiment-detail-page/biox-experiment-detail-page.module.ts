import {Injector, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CoreModule} from '../../../core/core.module';
import {BioxExperimentDetailPageComponent} from './component/biox-experiment-detail-page/biox-experiment-detail-page.component';
import {BioxExperimentCoreModule} from '../../../core/entity-module/biox-experiment-core/biox-experiment-core.module';
import {BioxWorkflowNodeComponent} from './component/biox-workflow-node/biox-workflow-node.component';
import {BioxWorkflowComponent} from './component/biox-workflow/biox-workflow.component';
import {createCustomElement} from '@angular/elements';
import {BioxProtocolCoreModule} from '../../../core/entity-module/biox-protocol-core/biox-protocol-core.module';
import {BioxWorkflowLayersBreadcrumbComponent} from './component/biox-workflow-layers-breadcrumb/biox-workflow-layers-breadcrumb.component';
import {BioxResourceCoreModule} from '../../../core/entity-module/biox-resource-core/biox-resource-core.module';
import {BioxConfigCoreModule} from '../../../core/entity-module/biox-config-core/biox-config-core.module';
import {BioxWorkflowNodeInterfaceComponent} from './component/biox-workflow-interface/biox-workflow-node-interface.component';
import {BioxWorkflowActionsComponent} from './component/biox-workflow-actions/biox-workflow-actions.component';
import {WorkflowManagerState} from './state/workflow-manager-state';
import {BioxWorkflowNodeDetailComponent} from './component/biox-workflow-node-detail/biox-workflow-node-detail.component';
import {WorkflowActionState} from './state/workflow-action-state';
import {BioxExperimentDetailPageState} from './state/biox-experiment-detail-page.state';
import {BioxWorkflowDrawerActionComponent} from './component/biox-workflow-drawer-action/biox-workflow-drawer-action.component';
import {BioxWorkflowAddProcessComponent} from './component/biox-workflow-add-process/biox-workflow-add-process.component';
import {BioxWorkflowPortsListComponent} from './component/biox-workflow-ports-list/biox-workflow-ports-list.component';
import {BioxWorkflowNodeConfigComponent} from './component/biox-workflow-node-config/biox-workflow-node-config.component';
import {BioxProgressBarInfoComponent} from './component/biox-progress-bar-info/biox-progress-bar-info.component';
import {BioxTaskSourceConfigComponent} from './component/biox-task-source-config/biox-task-source-config.component';
import {ReactiveFormsModule} from '@angular/forms';
import {BioxWorkflowNodeDetailState} from './state/biox-workflow-node-detail.state';
import {BioxProcessCoreModule} from '../../../core/entity-module/biox-process-core/biox-process-core.module';
import {BioxExperimentDetailCardComponent} from './component/biox-experiment-detail-card/biox-experiment-detail-card.component';
import {BioxProgressBarInfoDialogComponent} from './component/biox-progress-bar-info-dialog/biox-progress-bar-info-dialog.component';


@NgModule({
  declarations: [
    BioxExperimentDetailPageComponent,
    BioxWorkflowNodeComponent,
    BioxWorkflowComponent,
    BioxWorkflowLayersBreadcrumbComponent,
    BioxWorkflowNodeInterfaceComponent,
    BioxWorkflowActionsComponent,
    BioxWorkflowNodeDetailComponent,
    BioxWorkflowDrawerActionComponent,
    BioxWorkflowAddProcessComponent,
    BioxWorkflowPortsListComponent,
    BioxWorkflowNodeConfigComponent,
    BioxProgressBarInfoComponent,
    BioxTaskSourceConfigComponent,
    BioxExperimentDetailCardComponent,
    BioxProgressBarInfoDialogComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,

    CoreModule,
    BioxExperimentCoreModule,
    BioxProtocolCoreModule,
    BioxResourceCoreModule,
    BioxConfigCoreModule,
    BioxProcessCoreModule,
  ],
  providers: [
    // declare the state here otherwise the angular element can't access them
    BioxExperimentDetailPageState,
    WorkflowManagerState,
    WorkflowActionState,
    BioxWorkflowNodeDetailState,
  ]
})
export class BioxExperimentDetailPageModule {
  constructor(injector: Injector) {

    // declare the BioxWorkflowNodeComponent as angular element to make the tag
    // biox-workflow-node work natively
    const ngElement = createCustomElement(BioxWorkflowNodeComponent, {
      injector,
    });

    customElements.define('biox-workflow-node', ngElement);

    // declare the BioxWorkflowInterfaceComponent as angular element to make the tag
    // biox-workflow-node-interface work natively
    const ngElement2 = createCustomElement(BioxWorkflowNodeInterfaceComponent, {
      injector,
    });

    customElements.define('biox-workflow-node-interface', ngElement2);
  }
}
