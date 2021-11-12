import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LabMonitoringPageModule} from './lab-monitoring-page/lab-monitoring-page.module';
import {LabMonitoringRoutingModule} from './lab-monitoring-routing.module';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,

    LabMonitoringPageModule,

    LabMonitoringRoutingModule
  ]
})
export class LabMonitoringModule {
}
