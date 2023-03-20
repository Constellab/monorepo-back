import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LabCoreModule} from '../../../lab-core/lab-core.module';
import {
  LabExperimentDetailPageComponent
} from './component/lab-experiment-detail-page/lab-experiment-detail-page.component';
import {LabExperimentCoreModule} from '../../../lab-core/entity-module/lab-experiment-core/lab-experiment-core.module';
import {LabWorkflowComponent} from './component/lab-workflow/lab-workflow.component';
import {LabResourceCoreModule} from '../../../lab-core/entity-module/lab-resource-core/lab-resource-core.module';
import {LabConfigCoreModule} from '../../../lab-core/entity-module/lab-config-core/lab-config-core.module';
import {LabWorkflowActionsComponent} from './component/lab-workflow-actions/lab-workflow-actions.component';
import {LabWorkflowNodeDetailComponent} from './component/lab-workflow-node-detail/lab-workflow-node-detail.component';
import {LabExperimentDetailPageState} from './state/lab-experiment-detail-page.state';
import {
  LabWorkflowDrawerActionComponent
} from './component/lab-workflow-drawer-action/lab-workflow-drawer-action.component';
import {LabWorkflowNodeConfigComponent} from './component/lab-workflow-node-config/lab-workflow-node-config.component';
import {LabTaskSourceConfigComponent} from './component/lab-task-source-config/lab-task-source-config.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {LabWorkflowNodeDetailState} from './state/lab-workflow-node-detail.state';
import {
  LabExperimentDetailHeaderComponent
} from './component/lab-experiment-detail-header/lab-experiment-detail-header.component';
import {LabExperimentDetailComponent} from './component/lab-experiment-detail/lab-experiment-detail.component';
import {
  LabExperimentAssociatedReportsComponent
} from './component/lab-experiment-associated-reports/lab-experiment-associated-reports.component';
import {RouterModule} from '@angular/router';
import {LabTypeCoreModule} from '../../../lab-core/entity-module/lab-type-core/lab-type-core.module';
import {LabProtocolConfigComponent} from './component/lab-protocol-config/lab-protocol-config.component';
import {
  LabConfigureProtocolDialogComponent
} from './component/lab-configure-protocol-dialog/lab-configure-protocol-dialog.component';
import {LabConfigureProtocolComponent} from './component/lab-configure-protocol/lab-configure-protocol.component';
import {LabConfigureProcessComponent} from './component/lab-configure-process/lab-configure-process.component';
import {LabConfigureTaskComponent} from './component/lab-configure-task/lab-configure-task.component';
import {
  LabWorkflowNodeProgressComponent
} from './component/lab-workflow-node-progress/lab-workflow-node-progress.component';
import {LabEntityCoreModule} from '../../../lab-core/entity-module/lab-entity-core/lab-entity-core.module';
import {
  LabConfigureViewerDialogComponent
} from './component/lab-configure-viewer-dialog/lab-configure-viewer-dialog.component';
import {LabTaskViewerConfigComponent} from './component/lab-task-viewer-config/lab-task-viewer-config.component';
import {
  LabTaskViewerShowConfigComponent
} from './component/lab-task-viewer-show-config/lab-task-viewer-show-config.component';
import {LabReportCoreModule} from '../../../lab-core/entity-module/lab-report-core/lab-report-core.module';
import {LabLogCoreModule} from '../../../lab-core/entity-module/lab-log-core/lab-log-core.module';
import {LabMonitorCoreModule} from '../../../lab-core/entity-module/lab-monitor-core/lab-monitor-core.module';
import {
  LabProgressBarCoreModule
} from '../../../lab-core/entity-module/lab-progress-bar-core/lab-progress-bar-core.module';
import {LabProjectCoreModule} from '../../../lab-core/entity-module/lab-project-core/lab-project-core.module';


@NgModule({
  declarations: [
    LabExperimentDetailPageComponent,
    LabWorkflowComponent,
    LabWorkflowActionsComponent,
    LabWorkflowNodeDetailComponent,
    LabWorkflowDrawerActionComponent,
    LabWorkflowNodeConfigComponent,
    LabTaskSourceConfigComponent,
    LabExperimentDetailHeaderComponent,
    LabExperimentDetailComponent,
    LabExperimentAssociatedReportsComponent,
    LabProtocolConfigComponent,
    LabConfigureProtocolDialogComponent,
    LabConfigureProtocolComponent,
    LabConfigureProcessComponent,
    LabConfigureTaskComponent,
    LabWorkflowNodeProgressComponent,
    LabConfigureViewerDialogComponent,
    LabTaskViewerConfigComponent,
    LabTaskViewerShowConfigComponent,
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
    LabEntityCoreModule,
    LabTypeCoreModule,
    LabReportCoreModule,
    LabLogCoreModule,
    LabMonitorCoreModule,
    LabProgressBarCoreModule,
    LabProjectCoreModule,
  ],
  providers: [
    // declare the state here otherwise the angular element can't access them
    LabExperimentDetailPageState,
    LabWorkflowNodeDetailState,
  ]
})
export class LabExperimentDetailPageModule {
}
