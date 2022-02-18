import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CaAdminDashboardPageComponent} from './component/ca-admin-dashboard-page/ca-admin-dashboard-page.component';
import {CaCoreModule} from '../ca-core/ca-core.module';
import {CaAdminRoutingModule} from './ca-admin-routing.module';
import {
  CaAdminAccountsActivationComponent
} from './component/ca-admin-accounts-activation/ca-admin-accounts-activation.component';
import {
  CaAdminAccountActivationButtonComponent
} from './component/ca-admin-account-activation-button/ca-admin-account-activation-button.component';
import {
  CaAdminServerInfoListComponent
} from './component/ca-admin-server-info-list/ca-admin-server-info-list.component';
import {CaServerInfoCoreModule} from '../ca-core/entity-module/ca-server-info-core/ca-server-info-core.module';
import {
  CaAdminLabInstancesListComponent
} from './component/ca-admin-lab-instances-list/ca-admin-lab-instances-list.component';
import {CaLabCoreModule} from '../ca-core/entity-module/ca-lab-core/ca-lab-core.module';
import {
  CaAdminLabFrontVersionListComponent
} from './component/ca-admin-lab-front-version-list/ca-admin-lab-front-version-list.component';
import {
  CaLabFrontVersionCoreModule
} from '../ca-core/entity-module/ca-lab-front-version-core/ca-lab-front-version-core.module';

/**
 * Module only accessible by the admins
 */
@NgModule({
  declarations: [
    CaAdminDashboardPageComponent,
    CaAdminAccountsActivationComponent,
    CaAdminAccountActivationButtonComponent,
    CaAdminServerInfoListComponent,
    CaAdminLabInstancesListComponent,
    CaAdminLabFrontVersionListComponent,
  ],
  imports: [
    CommonModule,

    CaCoreModule,
    CaServerInfoCoreModule,
    CaLabCoreModule,
    CaLabFrontVersionCoreModule,

    CaAdminRoutingModule,
  ]
})
export class CaAdminModule {
}
