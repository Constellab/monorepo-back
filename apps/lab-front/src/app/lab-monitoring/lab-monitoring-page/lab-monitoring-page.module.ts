import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LabCoreModule} from '../../lab-core/lab-core.module';
import {LabMonitoringPageComponent} from './component/lab-monitoring-page/lab-monitoring-page.component';
import {LabBrickListStatusComponent} from './component/lab-brick-list-status/lab-brick-list-status.component';
import {LabHealthCheckComponent} from './component/lab-health-check/lab-health-check.component';
import {LabBrickMessageListComponent} from './component/lab-brick-message-list/lab-brick-message-list.component';


@NgModule({
  declarations: [
    LabMonitoringPageComponent,
    LabBrickListStatusComponent,
    LabHealthCheckComponent,
    LabBrickMessageListComponent
  ],
  imports: [
    CommonModule,

    LabCoreModule,
  ]
})
export class LabMonitoringPageModule {
}
