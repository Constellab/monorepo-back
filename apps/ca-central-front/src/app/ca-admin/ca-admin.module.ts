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

import {CaAdminSpacesListComponent} from './component/ca-admin-spaces-list/ca-admin-spaces-list.component';
import {CaSpaceCoreModule} from '../ca-core/entity-module/ca-space-core/ca-space-core.module';
import {CaAdminServersPageComponent} from './component/ca-admin-servers-page/ca-admin-servers-page.component';
import {CaAdminPageComponent} from './component/ca-admin-page/ca-admin-page.component';
import {
  CaAdminCloudProvidersListComponent
} from './component/ca-admin-cloud-providers-list/ca-admin-cloud-providers-list.component';
import {CaCloudProviderCoreModule} from '../ca-core/entity-module/ca-cloud-provider-core/ca-cloud-provider-core.module';
import {
  CaAdminBucketCredentialsListComponent
} from './component/ca-admin-bucket-credentials-list/ca-admin-bucket-credentials-list.component';
import {CaObjectStorageCoreModule} from '../ca-core/entity-module/ca-object-storage-core/ca-object-storage-core.module';
import {
  CaAdminBucketRegionsListComponent
} from './component/ca-admin-bucket-regions-list/ca-admin-bucket-regions-list.component';
import {CaAdminBucketListComponent} from './component/ca-admin-bucket-list/ca-admin-bucket-list.component';

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
    CaAdminSpacesListComponent,
    CaAdminServersPageComponent,
    CaAdminPageComponent,
    CaAdminCloudProvidersListComponent,
    CaAdminBucketCredentialsListComponent,
    CaAdminBucketRegionsListComponent,
    CaAdminBucketListComponent,
  ],
  imports: [
    CommonModule,

    CaCoreModule,
    CaServerInfoCoreModule,
    CaLabCoreModule,
    CaSpaceCoreModule,
    CaCloudProviderCoreModule,
    CaObjectStorageCoreModule,

    CaAdminRoutingModule,
  ]
})
export class CaAdminModule {
}
