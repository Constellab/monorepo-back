import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CaCoreModule} from '../ca-core/ca-core.module';
import {CaDashboardRoutingModule} from './ca-dashboard-routing.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CaDashboardPageModule} from './module/ca-dashboard-page/ca-dashboard-page.module';
import {CaProjectDetailPageModule} from './module/ca-project-detail-page/ca-project-detail-page.module';
import {CaExperimentDetailPageModule} from './module/ca-experiment-detail-page/ca-experiment-detail-page.module';
import {CaReportDetailPageModule} from './module/ca-report-detail-page/ca-report-detail-page.module';

/**
 * Module for the dashboard page
 */
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,

    CaCoreModule,

    // dashboard modules
    CaDashboardPageModule,
    CaProjectDetailPageModule,
    CaExperimentDetailPageModule,
    CaReportDetailPageModule,

    CaDashboardRoutingModule,
  ]
})
export class CaDashboardModule {
}
