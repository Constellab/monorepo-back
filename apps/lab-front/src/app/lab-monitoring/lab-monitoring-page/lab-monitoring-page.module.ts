import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LabCoreModule} from '../../lab-core/lab-core.module';
import {LabMonitoringPageComponent} from './component/lab-monitoring-page/lab-monitoring-page.component';
import {LabBrickListStatusComponent} from './component/lab-brick-list-status/lab-brick-list-status.component';
import {LabInfoComponent} from './component/lab-info/lab-info.component';
import {LabBrickMessageListComponent} from './component/lab-brick-message-list/lab-brick-message-list.component';
import {LabBrickInfoComponent} from './component/lab-brick-info/lab-brick-info.component';
import {
  LabBrickCallMigrationDialogComponent
} from './component/lab-brick-call-migration-dialog/lab-brick-call-migration-dialog.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {
  LabMonitoringDashboardPageComponent
} from './component/lab-monitoring-dashboard-page/lab-monitoring-dashboard-page.component';
import {
  LabMonitoringVenvsPageComponent
} from './component/lab-monitoring-venvs-page/lab-monitoring-venvs-page.component';
import {RouterModule} from '@angular/router';
import {LabVenvCoreModule} from '../../lab-core/entity-module/lab-venv-core/lab-venv-core.module';


@NgModule({
  declarations: [
    LabMonitoringPageComponent,
    LabBrickListStatusComponent,
    LabInfoComponent,
    LabBrickMessageListComponent,
    LabBrickInfoComponent,
    LabBrickCallMigrationDialogComponent,
    LabMonitoringDashboardPageComponent,
    LabMonitoringVenvsPageComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,

    LabCoreModule,
    LabVenvCoreModule,
  ]
})
export class LabMonitoringPageModule {
}
