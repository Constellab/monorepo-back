import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AdminDashboardPageComponent} from './component/admin-dashboard-page/admin-dashboard-page.component';
import {CoreModule} from '../core/core.module';
import {AdminRoutingModule} from './admin-routing.module';
import {AdminAccountsActivationComponent} from './component/admin-accounts-activation/admin-accounts-activation.component';
import {AdminAccountActivationButtonComponent} from './component/admin-account-activation-button/admin-account-activation-button.component';
import {AdminServerInfoListComponent} from './component/admin-server-info-list/admin-server-info-list.component';
import {ServerInfoCoreModule} from '../core/entity-module/server-info-core/server-info-core.module';
import {AdminLabInstancesListComponent} from './component/admin-lab-instances-list/admin-lab-instances-list.component';
import {LabCoreModule} from '../core/entity-module/lab-core/lab-core.module';

/**
 * Module only accessible by the admins
 */
@NgModule({
  declarations: [
    AdminDashboardPageComponent,
    AdminAccountsActivationComponent,
    AdminAccountActivationButtonComponent,
    AdminServerInfoListComponent,
    AdminLabInstancesListComponent
  ],
  imports: [
    CommonModule,

    CoreModule,
    ServerInfoCoreModule,
    LabCoreModule,

    AdminRoutingModule,
  ]
})
export class AdminModule {
}
