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
import {CaLabInstanceTableComponent} from './component/ca-lab-instance-table/ca-lab-instance-table.component';
import {
  CaLabInstanceFormDialogComponent
} from './component/ca-lab-instance-form-dialog/ca-lab-instance-form-dialog.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CaServerInfoCoreModule} from '../ca-server-info-core/ca-server-info-core.module';
import {
  CaLabInstanceStatusDialogComponent
} from './component/ca-lab-instance-status-dialog/ca-lab-instance-status-dialog.component';
import {CaLabLoginButtonComponent} from './component/ca-lab-login-button/ca-lab-login-button.component';
import {CaSpaceCoreModule} from '../ca-space-core/ca-space-core.module';
import {CaConfigCoreModule} from '../ca-config-core/ca-config-core.module';
import {CaLabInstanceSearchComponent} from './component/ca-lab-instance-search/ca-lab-instance-search.component';
import {
  CaLabInstanceSearchFormComponent
} from './component/ca-lab-instance-search-form/ca-lab-instance-search-form.component';

/**
 * Core module for Lab and LabInstance
 */
@NgModule({
  declarations: [
    CaLabInstanceCardComponent,
    CaSelectAccessibleLabInstanceOptionsComponent,
    CaLabInstanceStartStopComponent,
    CaLabInstanceTableComponent,
    CaLabInstanceFormDialogComponent,
    CaLabInstanceStatusDialogComponent,
    CaLabLoginButtonComponent,
    CaLabInstanceSearchComponent,
    CaLabInstanceSearchFormComponent,
  ],
  exports: [
    CaLabInstanceCardComponent,
    CaSelectAccessibleLabInstanceOptionsComponent,
    CaLabInstanceStartStopComponent,
    CaLabInstanceTableComponent,
    CaLabInstanceFormDialogComponent,
    CaLabLoginButtonComponent,
    CaLabInstanceSearchComponent,
    CaLabInstanceSearchFormComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,

    CaServerInfoCoreModule,
    CaSpaceCoreModule,
    CaConfigCoreModule,

    CaCoreModule,
  ]
})
export class CaLabCoreModule {
}
