import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ExperimentDetailPageComponent} from './component/experiment-detail-page/experiment-detail-page.component';
import {ExperimentCardDetailComponent} from './component/experiment-card-detail/experiment-card-detail.component';
import {CoreModule} from '../../../core/core.module';
import {ExperimentCoreModule} from '../experiment-core/experiment-core.module';
import {ReportsListComponent} from './component/reports-list/reports-list.component';
import {ReportCoreModule} from '../report-core/report-core.module';
import {RouterModule} from '@angular/router';
import {LabCoreModule} from '../../../core/entity-module/lab-core/lab-core.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';


@NgModule({
  declarations: [
    ExperimentDetailPageComponent,
    ExperimentCardDetailComponent,
    ReportsListComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,

    CoreModule,
    ExperimentCoreModule,
    LabCoreModule,
    ReportCoreModule,
  ]
})
export class ExperimentDetailPageModule {
}
