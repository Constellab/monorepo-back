import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CaCoreModule} from '../../../ca-core/ca-core.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CaLabCoreModule} from '../../../ca-core/entity-module/ca-lab-core/ca-lab-core.module';
import {RouterModule} from '@angular/router';
import {CaExperimentInfoComponent} from './component/ca-experiment-info/ca-experiment-info.component';
import {CaExperimentsListComponent} from './component/ca-experiments-list/ca-experiments-list.component';
import {CaDashboardCoreModule} from '../ca-dashboard-core/ca-dashboard-core.module';
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
  CaExperimentLabConfigDialogComponent
} from './component/ca-experiment-lab-config-dialog/ca-experiment-lab-config-dialog.component';
import {
  CaExperimentTechnicalReportIntOutComponent
} from './component/ca-experiment-technical-report-int-out/ca-experiment-technical-report-int-out.component';
import {
  CaExperimentTechnicalReportProcessDocDialogComponent
} from './component/ca-experiment-technical-report-process-doc-dialog/ca-experiment-technical-report-process-doc-dialog.component';
import {TdTechnicalDocModule} from "@monorepo/technical-doc";


@NgModule({
  declarations: [
    CaExperimentInfoComponent,
    CaExperimentsListComponent,
    CaExperimentTechnicalReportComponent,
    CaExperimentTechnicalReportNodeComponent,
    CaExperimentTechnicalReportGraphComponent,
    CaExperimentTechnicalReportLinkComponent,
    CaExperimentLabConfigDialogComponent,
    CaExperimentTechnicalReportIntOutComponent,
    CaExperimentTechnicalReportProcessDocDialogComponent,
  ],
  exports: [
    CaExperimentInfoComponent,
    CaExperimentsListComponent,
    CaExperimentTechnicalReportComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,

    CaCoreModule,
    CaLabCoreModule,
    TdTechnicalDocModule,
    CaDashboardCoreModule,
  ]
})
export class CaExperimentCoreModule {

}
