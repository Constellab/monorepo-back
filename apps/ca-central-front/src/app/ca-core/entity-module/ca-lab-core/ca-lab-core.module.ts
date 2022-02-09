import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CaCoreModule} from '../../ca-core.module';
import {CaLabCardComponent} from './component/ca-lab-card/ca-lab-card.component';
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
import {CaSelectLabOptionsComponent} from './component/ca-select-lab-options/ca-select-lab-options.component';
import {CaLabTableComponent} from './component/ca-lab-table/ca-lab-table.component';
import {CaLabFormDialogComponent} from './component/ca-lab-form-dialog/ca-lab-form-dialog.component';
import {
  CaLabInstanceStatusDialogComponent
} from './component/ca-lab-instance-status-dialog/ca-lab-instance-status-dialog.component';
import {CaLabLoginButtonComponent} from './component/ca-lab-login-button/ca-lab-login-button.component';

/**
 * Core module for Lab and LabInstance
 */
@NgModule({
  declarations: [
    CaLabCardComponent,
    CaLabInstanceCardComponent,
    CaSelectAccessibleLabInstanceOptionsComponent,
    CaLabInstanceStartStopComponent,
    CaLabInstancesListComponent,
    CaLabInstanceTableComponent,
    CaLabInstanceFormDialogComponent,
    CaSelectLabOptionsComponent,
    CaLabTableComponent,
    CaLabFormDialogComponent,
    CaLabInstanceStatusDialogComponent,
    CaLabLoginButtonComponent,
  ],
  exports: [
    CaLabCardComponent,
    CaLabInstanceCardComponent,
    CaSelectAccessibleLabInstanceOptionsComponent,
    CaLabInstanceStartStopComponent,
    CaLabInstancesListComponent,
    CaLabInstanceTableComponent,
    CaLabInstanceFormDialogComponent,
    CaSelectLabOptionsComponent,
    CaLabTableComponent,
    CaLabFormDialogComponent,
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
