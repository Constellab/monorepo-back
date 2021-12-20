import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {
  CaExperimentDetailPageComponent
} from './component/ca-experiment-detail-page/ca-experiment-detail-page.component';
import {
  CaExperimentCardDetailComponent
} from './component/ca-experiment-card-detail/ca-experiment-card-detail.component';
import {CaCoreModule} from '../../../ca-core/ca-core.module';
import {CaExperimentCoreModule} from '../ca-experiment-core/ca-experiment-core.module';
import {CaReportsListComponent} from './component/ca-reports-list/ca-reports-list.component';
import {CaReportCoreModule} from '../ca-report-core/ca-report-core.module';
import {RouterModule} from '@angular/router';
import {CaLabCoreModule} from '../../../ca-core/entity-module/ca-lab-core/ca-lab-core.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';


@NgModule({
  declarations: [
    CaExperimentDetailPageComponent,
    CaExperimentCardDetailComponent,
    CaReportsListComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,

    CaCoreModule,
    CaExperimentCoreModule,
    CaLabCoreModule,
    CaReportCoreModule,
  ]
})
export class CaExperimentDetailPageModule {
}
