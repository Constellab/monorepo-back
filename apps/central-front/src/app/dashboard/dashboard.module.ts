import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CoreModule} from '../core/core.module';
import {DashboardRoutingModule} from './dashboard-routing.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {DashboardPageModule} from './module/dashboard-page/dashboard-page.module';
import {ProjectDetailPageModule} from './module/project-detail-page/project-detail-page.module';
import {ExperimentDetailPageModule} from './module/experiment-detail-page/experiment-detail-page.module';

/**
 * Module for the dashboard page
 */
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,

    CoreModule,

    // dashboard modules
    DashboardPageModule,
    ProjectDetailPageModule,
    ExperimentDetailPageModule,

    DashboardRoutingModule,
  ]
})
export class DashboardModule {
}
