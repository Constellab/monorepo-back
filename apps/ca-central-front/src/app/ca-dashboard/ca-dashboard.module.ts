import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CaCoreModule} from '../ca-core/ca-core.module';
import {CaDashboardRoutingModule} from './ca-dashboard-routing.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CaDashboardPageModule} from './module/ca-dashboard-page/ca-dashboard-page.module';

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

    CaDashboardRoutingModule,
  ]
})
export class CaDashboardModule {
}
