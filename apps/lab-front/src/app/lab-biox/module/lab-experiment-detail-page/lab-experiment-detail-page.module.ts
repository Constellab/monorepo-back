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
import {LabWorkflowAddProcessComponent} from './component/lab-workflow-add-process/lab-workflow-add-process.component';
import {LabWorkflowPortsListComponent} from './component/lab-workflow-ports-list/lab-workflow-ports-list.component';
import {LabWorkflowNodeConfigComponent} from './component/lab-workflow-node-config/lab-workflow-node-config.component';
import {LabProgressBarInfoComponent} from './component/lab-progress-bar-info/lab-progress-bar-info.component';
import {LabTaskSourceConfigComponent} from './component/lab-task-source-config/lab-task-source-config.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {LabWorkflowNodeDetailState} from './state/lab-workflow-node-detail.state';
import {LabProcessCoreModule} from '../../../lab-core/entity-module/lab-process-core/lab-process-core.module';
import {
  LabExperimentDetailCardComponent
} from './component/lab-experiment-detail-card/lab-experiment-detail-card.component';
import {
  LabProgressBarInfoDialogComponent
} from './component/lab-progress-bar-info-dialog/lab-progress-bar-info-dialog.component';
import {
  LabExperimentValidationDialogComponent
} from './component/lab-experiment-validation-dialog/lab-experiment-validation-dialog.component';
import {LabProjectCoreModule} from '../../../lab-core/entity-module/lab-project-core/lab-project-core.module';
import {LabWorkflowNodeSourceComponent} from './component/lab-workflow-node-source/lab-workflow-node-source.component';


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
    LabWorkflowAddProcessComponent,
    LabWorkflowPortsListComponent,
    LabWorkflowNodeConfigComponent,
    LabProgressBarInfoComponent,
    LabTaskSourceConfigComponent,
    LabExperimentDetailCardComponent,
    LabProgressBarInfoDialogComponent,
    LabExperimentValidationDialogComponent,
    LabWorkflowNodeSourceComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,

    LabCoreModule,
    LabExperimentCoreModule,
    LabResourceCoreModule,
    LabConfigCoreModule,
    LabProcessCoreModule,
    LabProjectCoreModule,
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
    // lab-workflow-node-interface work natively
    customElements.define('lab-workflow-node-interface',
      createCustomElement(LabWorkflowNodeInterfaceComponent, {
        injector,
      }));
  }
}
