import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CaCoreModule} from '../ca-core/ca-core.module';
import {CaLabInstanceRoutingModule} from './ca-lab-instance-routing.module';
import {
  CaLabInstanceDetailPageComponent
} from './component/ca-lab-instance-detail-page/ca-lab-instance-detail-page.component';
import {CaLabInstanceDetailComponent} from './component/ca-lab-instance-detail/ca-lab-instance-detail.component';
import {CaLabCoreModule} from '../ca-core/entity-module/ca-lab-core/ca-lab-core.module';
import {CaServerInfoCoreModule} from '../ca-core/entity-module/ca-server-info-core/ca-server-info-core.module';
import {CaLabInstanceIframeComponent} from './component/ca-lab-instance-iframe/ca-lab-instance-iframe.component';
import {
  CaLabInstanceIframePageComponent
} from './component/ca-lab-instance-iframe-page/ca-lab-instance-iframe-page.component';
import {CaMyLabInstancesPageComponent} from './component/ca-my-lab-instances-page/ca-my-lab-instances-page.component';
import {
  CaLabInstanceUsersListComponent
} from './component/ca-lab-instance-users-list/ca-lab-instance-users-list.component';
import {
  CaLabInstanceUsersTableComponent
} from './component/ca-lab-instance-users-table/ca-lab-instance-users-table.component';
import {
  CaLabInstanceUserFormDialogComponent
} from './component/ca-lab-instance-user-form-dialog/ca-lab-instance-user-form-dialog.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {
  CaLabInstanceUpdateNameDialogComponent
} from './component/ca-lab-instance-update-name-dialog/ca-lab-instance-update-name-dialog.component';

/**
 * Module the lab instance detail page with iframe for the lab
 */
@NgModule({
  declarations: [
    CaLabInstanceDetailPageComponent,
    CaLabInstanceDetailComponent,
    CaLabInstanceIframeComponent,
    CaLabInstanceIframePageComponent,
    CaMyLabInstancesPageComponent,
    CaLabInstanceUsersListComponent,
    CaLabInstanceUsersTableComponent,
    CaLabInstanceUserFormDialogComponent,
    CaLabInstanceUpdateNameDialogComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,

    CaCoreModule,
    CaLabCoreModule,
    CaServerInfoCoreModule,

    CaLabInstanceRoutingModule,
  ]
})
export class CaLabInstanceModule {
}
