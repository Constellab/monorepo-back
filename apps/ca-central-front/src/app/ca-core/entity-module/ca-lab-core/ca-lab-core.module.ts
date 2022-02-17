import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CaCoreModule} from '../../ca-core.module';
import {CaLabInstanceCardComponent} from './component/ca-lab-instance-card/ca-lab-instance-card.component';
import {
  CaSelectAccessibleLabInstanceOptionsComponent
} from './component/ca-select-accessible-lab-instance-options/ca-select-accessible-lab-instance-options.component';
import {
  CaLabInstanceStartStopComponent
} from './component/ca-lab-instance-start-stop/ca-lab-instance-start-stop.component';
import {RouterModule} from '@angular/router';
import {CaLabInstancesListComponent} from './component/ca-lab-instances-list/ca-lab-instances-list.component';
import {CaLabInstanceTableComponent} from './component/ca-lab-instance-table/ca-lab-instance-table.component';
import {
  CaLabInstanceFormDialogComponent
} from './component/ca-lab-instance-form-dialog/ca-lab-instance-form-dialog.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CaServerInfoCoreModule} from '../ca-server-info-core/ca-server-info-core.module';
import {CaLabConfigTableComponent} from './component/ca-lab-table-config/ca-lab-config-table.component';
import {
  CaLabInstanceStatusDialogComponent
} from './component/ca-lab-instance-status-dialog/ca-lab-instance-status-dialog.component';
import {CaLabLoginButtonComponent} from './component/ca-lab-login-button/ca-lab-login-button.component';

/**
 * Core module for Lab and LabInstance
 */
@NgModule({
  declarations: [
    CaLabInstanceCardComponent,
    CaSelectAccessibleLabInstanceOptionsComponent,
    CaLabInstanceStartStopComponent,
    CaLabInstancesListComponent,
    CaLabInstanceTableComponent,
    CaLabInstanceFormDialogComponent,
    CaLabConfigTableComponent,
    CaLabInstanceStatusDialogComponent,
    CaLabLoginButtonComponent,
  ],
  exports: [
    CaLabInstanceCardComponent,
    CaSelectAccessibleLabInstanceOptionsComponent,
    CaLabInstanceStartStopComponent,
    CaLabInstancesListComponent,
    CaLabInstanceTableComponent,
    CaLabInstanceFormDialogComponent,
    CaLabConfigTableComponent,
    CaLabLoginButtonComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,

    CaServerInfoCoreModule,

    CaCoreModule,
  ]
})
export class CaLabCoreModule {
}
