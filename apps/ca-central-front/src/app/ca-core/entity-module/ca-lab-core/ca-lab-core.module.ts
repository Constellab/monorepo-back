import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CaCoreModule} from '../../ca-core.module';
import {CaLabInstanceCardComponent} from './component/ca-lab-instance-card/ca-lab-instance-card.component';
import {
  CaSelectAccessibleLabInstanceOptionsComponent
} from './component/ca-select-accessible-lab-instance-options/ca-select-accessible-lab-instance-options.component';
import {RouterModule} from '@angular/router';
import {CaLabInstanceTableComponent} from './component/ca-lab-instance-table/ca-lab-instance-table.component';
import {
  CaLabInstanceAdminFormDialogComponent
} from './component/ca-lab-instance-admin-form-dialog/ca-lab-instance-admin-form-dialog.component';
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
import {CaCloudProviderCoreModule} from '../ca-cloud-provider-core/ca-cloud-provider-core.module';
import {CaLabConfigDialogComponent} from './component/ca-lab-config-dialog/ca-lab-config-dialog.component';
import {CaLabConfigComponent} from './component/ca-lab-config/ca-lab-config.component';
import {
  CaLabInstanceFormDialogComponent
} from './component/ca-lab-instance-form-dialog/ca-lab-instance-form-dialog.component';

/**
 * Core module for Lab and LabInstance
 */
@NgModule({
  declarations: [
    CaLabInstanceCardComponent,
    CaSelectAccessibleLabInstanceOptionsComponent,
    CaLabInstanceTableComponent,
    CaLabInstanceAdminFormDialogComponent,
    CaLabInstanceStatusDialogComponent,
    CaLabLoginButtonComponent,
    CaLabInstanceSearchComponent,
    CaLabInstanceSearchFormComponent,
    CaLabConfigDialogComponent,
    CaLabConfigComponent,
    CaLabInstanceFormDialogComponent,
  ],
  exports: [
    CaLabInstanceCardComponent,
    CaSelectAccessibleLabInstanceOptionsComponent,
    CaLabInstanceTableComponent,
    CaLabInstanceAdminFormDialogComponent,
    CaLabLoginButtonComponent,
    CaLabInstanceSearchComponent,
    CaLabInstanceSearchFormComponent,
    CaLabConfigDialogComponent,
    CaLabConfigComponent,
    CaLabInstanceFormDialogComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,

    CaServerInfoCoreModule,
    CaSpaceCoreModule,
    CaConfigCoreModule,
    CaCloudProviderCoreModule,

    CaCoreModule,
  ]
})
export class CaLabCoreModule {
}
