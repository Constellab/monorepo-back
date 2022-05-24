import {Injector, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LabCoreModule} from '../../../lab-core/lab-core.module';
import {
  LabExperimentDetailPageComponent
} from './component/lab-experiment-detail-page/lab-experiment-detail-page.component';
import {LabExperimentCoreModule} from '../../../lab-core/entity-module/lab-experiment-core/lab-experiment-core.module';
import {LabWorkflowNodeComponent} from './component/lab-workflow-node/lab-workflow-node.component';
import {LabWorkflowComponent} from './component/lab-workflow/lab-workflow.component';
import {createCustomElement} from '@angular/elements';
import {
  LabWorkflowLayersBreadcrumbComponent
} from './component/lab-workflow-layers-breadcrumb/lab-workflow-layers-breadcrumb.component';
import {LabResourceCoreModule} from '../../../lab-core/entity-module/lab-resource-core/lab-resource-core.module';
import {LabConfigCoreModule} from '../../../lab-core/entity-module/lab-config-core/lab-config-core.module';
import {
  LabWorkflowNodeInterfaceComponent
} from './component/lab-workflow-interface/lab-workflow-node-interface.component';
import {LabWorkflowActionsComponent} from './component/lab-workflow-actions/lab-workflow-actions.component';
import {LabWorkflowManagerState} from './state/lab-workflow-manager-state';
import {LabWorkflowNodeDetailComponent} from './component/lab-workflow-node-detail/lab-workflow-node-detail.component';
import {LabWorkflowActionState} from './state/lab-workflow-action-state';
import {LabExperimentDetailPageState} from './state/lab-experiment-detail-page.state';
import {
  LabWorkflowDrawerActionComponent
} from './component/lab-workflow-drawer-action/lab-workflow-drawer-action.component';
import {LabWorkflowPortsListComponent} from './component/lab-workflow-ports-list/lab-workflow-ports-list.component';
import {LabWorkflowNodeConfigComponent} from './component/lab-workflow-node-config/lab-workflow-node-config.component';
import {LabProgressBarInfoComponent} from './component/lab-progress-bar-info/lab-progress-bar-info.component';
import {LabTaskSourceConfigComponent} from './component/lab-task-source-config/lab-task-source-config.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {LabWorkflowNodeDetailState} from './state/lab-workflow-node-detail.state';
import {
  LabExperimentDetailHeaderComponent
} from './component/lab-experiment-detail-header/lab-experiment-detail-header.component';
import {
  LabProgressBarInfoDialogComponent
} from './component/lab-progress-bar-info-dialog/lab-progress-bar-info-dialog.component';
import {LabProjectCoreModule} from '../../../lab-core/entity-module/lab-project-core/lab-project-core.module';
import {LabWorkflowNodeSourceComponent} from './component/lab-workflow-node-source/lab-workflow-node-source.component';
import {LabExperimentDetailComponent} from './component/lab-experiment-detail/lab-experiment-detail.component';
import {
  LabExperimentAssociatedReportsComponent
} from './component/lab-experiment-associated-reports/lab-experiment-associated-reports.component';
import {RouterModule} from '@angular/router';
import {LabTypeCoreModule} from '../../../lab-core/entity-module/lab-type-core/lab-type-core.module';
import {LabWorkflowNodeOutputComponent} from './component/lab-workflow-node-output/lab-workflow-node-output.component';
import {LabProtocolConfigComponent} from './component/lab-protocol-config/lab-protocol-config.component';
import {
  LabConfigureProtocolDialogComponent
} from './component/lab-configure-protocol-dialog/lab-configure-protocol-dialog.component';
import {LabConfigureProtocolComponent} from './component/lab-configure-protocol/lab-configure-protocol.component';
import {LabConfigureProcessComponent} from './component/lab-configure-process/lab-configure-process.component';
import {LabConfigureTaskComponent} from './component/lab-configure-task/lab-configure-task.component';


@NgModule({
  declarations: [
    LabExperimentDetailPageComponent,
    LabWorkflowNodeComponent,
    LabWorkflowComponent,
    LabWorkflowLayersBreadcrumbComponent,
    LabWorkflowNodeInterfaceComponent,
    LabWorkflowActionsComponent,
    LabWorkflowNodeDetailComponent,
    LabWorkflowDrawerActionComponent,
    LabWorkflowPortsListComponent,
    LabWorkflowNodeConfigComponent,
    LabProgressBarInfoComponent,
    LabTaskSourceConfigComponent,
    LabExperimentDetailHeaderComponent,
    LabProgressBarInfoDialogComponent,
    LabWorkflowNodeSourceComponent,
    LabExperimentDetailComponent,
    LabExperimentAssociatedReportsComponent,
    LabWorkflowNodeOutputComponent,
    LabProtocolConfigComponent,
    LabConfigureProtocolDialogComponent,
    LabConfigureProtocolComponent,
    LabConfigureProcessComponent,
    LabConfigureTaskComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,

    LabCoreModule,
    LabExperimentCoreModule,
    LabResourceCoreModule,
    LabConfigCoreModule,
    LabProjectCoreModule,
    LabTypeCoreModule,
  ],
  providers: [
    // declare the state here otherwise the angular element can't access them
    LabExperimentDetailPageState,
    LabWorkflowManagerState,
    LabWorkflowActionState,
    LabWorkflowNodeDetailState,
  ]
})
export class LabExperimentDetailPageModule {
  constructor(injector: Injector) {

    // declare the LabWorkflowNodeComponent as angular element to make the tag
    // lab-workflow-node work natively
    customElements.define('lab-workflow-node',
      createCustomElement(LabWorkflowNodeComponent, {
        injector,
      }));

    // declare the LabWorkflowNodeSourceComponent as angular element to make the tag
    // lab-workflow-node-source work natively
    customElements.define('lab-workflow-node-source',
      createCustomElement(LabWorkflowNodeSourceComponent, {
        injector,
      }));

    // declare the LabWorkflowNodeInterfaceComponent as angular element to make the tag
    // lab-workflow-node-output work natively
    customElements.define('lab-workflow-node-output',
      createCustomElement(LabWorkflowNodeOutputComponent, {
        injector,
      }));

    // declare the LabWorkflowNodeInterfaceComponent as angular element to make the tag
    // lab-workflow-node-interface work natively
    customElements.define('lab-workflow-node-interface',
      createCustomElement(LabWorkflowNodeInterfaceComponent, {
        injector,
      }));
  }
}
