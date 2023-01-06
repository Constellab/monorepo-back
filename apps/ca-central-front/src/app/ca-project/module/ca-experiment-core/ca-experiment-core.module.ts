import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CaCoreModule} from '../../../ca-core/ca-core.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CaLabCoreModule} from '../../../ca-core/entity-module/ca-lab-core/ca-lab-core.module';
import {RouterModule} from '@angular/router';
import {CaExperimentInfoComponent} from './component/ca-experiment-info/ca-experiment-info.component';
import {CaExperimentsListComponent} from './component/ca-experiments-list/ca-experiments-list.component';
import {
  CaExperimentTechnicalReportComponent
} from './component/ca-experiment-technical-report/ca-experiment-technical-report.component';
import {
  CaExperimentTechnicalReportNodeComponent
} from './component/ca-experiment-technical-report-node/ca-experiment-technical-report-node.component';
import {
  CaExperimentTechnicalReportGraphComponent
} from './component/ca-experiment-technical-report-graph/ca-experiment-technical-report-graph.component';
import {
  CaExperimentTechnicalReportLinkComponent
} from './component/ca-experiment-technical-report-link/ca-experiment-technical-report-link.component';
import {
  CaExperimentTechnicalReportIntOutComponent
} from './component/ca-experiment-technical-report-int-out/ca-experiment-technical-report-int-out.component';
import {
  CaExperimentTechnicalReportProcessDocDialogComponent
} from './component/ca-experiment-technical-report-process-doc-dialog/ca-experiment-technical-report-process-doc-dialog.component';
import {TdTechnicalDocModule} from '@monorepo/technical-doc';
import {MatTabsModule} from '@angular/material/tabs';
import {
  CaExperimentTechnicalReportWorkflowDrawerComponent
} from './component/ca-experiment-technical-report-workflow-drawer/ca-experiment-technical-report-workflow-drawer.component';
import {
  CaExperimentTechnicalReportResourceDialogComponent
} from './component/ca-experiment-technical-report-resource-dialog/ca-experiment-technical-report-resource-dialog.component';
import {
  CaExperimentTechnicalReportResourceInfoComponent
} from './component/ca-experiment-technical-report-resource-info/ca-experiment-technical-report-resource-info.component';
import {FlColorModule, FlDragModule} from '@monorepo/front-core-lib';
import {CaExperimentTableComponent} from './component/ca-experiment-table/ca-experiment-table.component';
import {CaProjectObjectCoreModule} from '../ca-project-object-core/ca-project-object-core.module';
import {
  CaExperimentCardDetailComponent
} from './component/ca-experiment-card-detail/ca-experiment-card-detail.component';


@NgModule({
  declarations: [
    CaExperimentInfoComponent,
    CaExperimentsListComponent,
    CaExperimentTechnicalReportComponent,
    CaExperimentTechnicalReportNodeComponent,
    CaExperimentTechnicalReportGraphComponent,
    CaExperimentTechnicalReportLinkComponent,
    CaExperimentTechnicalReportIntOutComponent,
    CaExperimentTechnicalReportProcessDocDialogComponent,
    CaExperimentTechnicalReportWorkflowDrawerComponent,
    CaExperimentTechnicalReportResourceDialogComponent,
    CaExperimentTechnicalReportResourceInfoComponent,
    CaExperimentTableComponent,
    CaExperimentCardDetailComponent,
  ],
  exports: [
    CaExperimentInfoComponent,
    CaExperimentsListComponent,
    CaExperimentTechnicalReportComponent,
    CaExperimentCardDetailComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,

    CaCoreModule,
    CaLabCoreModule,
    TdTechnicalDocModule,
    MatTabsModule,
    CaProjectObjectCoreModule,
    FlColorModule,
    FlDragModule
  ]
})
export class CaExperimentCoreModule {

}
